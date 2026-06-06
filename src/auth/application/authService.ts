import {bcryptService} from "../adapters/bcrypt.service";
import {usersService} from "../../modules/user/application/usersService";
import {ResultStatus} from "../../core/result/resultCode";
import {IUserDB} from "../../modules/user/types/user.db.interface";
import {WithId} from "mongodb";
import {Result} from "../../core/result/result.type";
import {jwtService} from "../adapters/jwt.service";
import {nodemailerService} from "../adapters/nodemailer.service";
import {randomUUID} from "node:crypto";
import {emailExamples} from "../adapters/email-examples";
import {usersRepository} from "../../modules/user/repositories/user.repository";
import {authRepository} from "../repositories/auth.repository";
import {RefreshToken} from "../types/refresh-token";


export const authService = {
    async loginUser(
        loginOrEmail: string,
        password: string,
    ): Promise<Result<{ accessToken: string, refreshToken: string } | null>> {
        const result = await authService.checkUserCredentials(loginOrEmail, password);

        if (result.status !== ResultStatus.Success) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Unauthorized",
                extensions: [{field: loginOrEmail, message: "Wrong credentials"}]
            };
        }

        const accessToken = await jwtService.createAccessToken(result.data!._id.toString());
        const refreshToken = await jwtService.createRefreshToken(result.data!._id.toString());

        const saveResult = await this.saveRefreshToken(refreshToken);

        if (saveResult.status !== ResultStatus.NoContent) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{field: null, message: 'Failed to save refresh token'}],
            };
        }

        return {
            status: ResultStatus.Success,
            data: {accessToken, refreshToken},
            extensions: [],
        };
    },

    async checkUserCredentials(
        loginOrEmail: string,
        password: string,
    ): Promise<Result<WithId<IUserDB> | null>> {
        const user = await usersService.findByLoginOrEmail(loginOrEmail);

        if (!user)
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: "Not Found",
                extensions: [{field: loginOrEmail, message: "Not Found"}]
            };

        const isPassCorrect = await bcryptService.checkPassword(password, user.passwordHash);

        if (!isPassCorrect)
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad Request',
                extensions: [{field: 'password', message: 'Wrong password'}],
            };

        return {
            status: ResultStatus.Success,
            data: user,
            extensions: [],
        };
    },

    async registerUser(
        login: string,
        password: string,
        email: string
    ): Promise<Result<string | null>> {

        const userByLogin = await usersService.findByLoginOrEmail(login)
        const userByEmail = await usersService.findByLoginOrEmail(email)

        if (userByLogin || userByEmail) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{field: userByLogin ? 'login' : 'email', message: 'Already Registered'}],
            }
        }

        const passwordHash = await bcryptService.generateHash(password);

        const newUser: IUserDB = {
            login: login,
            passwordHash: passwordHash,
            email: email,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                isConfirmed: false,
            }
        };

        const createdId = await usersRepository.create(newUser);

        await nodemailerService
            .sendEmail(
                newUser.email,
                newUser.emailConfirmation.confirmationCode,
                emailExamples.registrationEmail
            )
            .catch(er => console.error('error in send email:', er));

        return {
            status: ResultStatus.NoContent,
            data: createdId,
            extensions: [],
        };
    },

    async resendEmailConfirmationCode(email: string): Promise<Result<string | null>> {

        const userByEmail = await usersService.findByLoginOrEmail(email)

        if (!userByEmail) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{field: 'email', message: 'Invalid email'}],
            }
        }

        if (userByEmail.emailConfirmation.isConfirmed) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{field: 'email', message: 'Email confirmed'}],
            }
        }

        const confirmationCode = randomUUID()
        const expirationDate = new Date(Date.now() + 60 * 60 * 1000).toISOString()

        await usersRepository.updateEmailConfirmationCode(email, confirmationCode, expirationDate);

        try {
            await nodemailerService.sendEmail(
                email,
                confirmationCode,
                emailExamples.registrationEmail
            )
        } catch (e) {
            console.error('error in send email:', e);
        }

        return {
            status: ResultStatus.NoContent,
            data: null,
            extensions: [],
        };
    },

    async confirmEmail(code: string): Promise<Result> {

        const result = await usersService.updateEmailConfirmationStatus(code);

        if (!result) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{field: 'code', message: 'Incorrect code'}],
            };
        }

        return {
            status: ResultStatus.NoContent,
            data: null,
            extensions: [],

        };
    },

    async saveRefreshToken(refreshToken: string): Promise<Result> {
        const decodedToken = await jwtService.decodeToken(refreshToken);

        if (!decodedToken || typeof decodedToken.exp !== 'number') {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{field: null, message: 'Can\'t decode token'}],
            };
        }

        const newRefreshToken: RefreshToken = {
            refreshToken: refreshToken,
            expireDate: new Date(decodedToken.exp * 1000),
            isValid: true,
        }

        await authRepository.saveRefreshToken(newRefreshToken);

        return {
            status: ResultStatus.NoContent,
            data: null,
            extensions: [],
        };
    },

    async findRefreshToken(refreshToken: string): Promise<Result<RefreshToken | null>> {
        const result = await authRepository.findRefreshToken(refreshToken);

        if (!result) {
            return {
                status: ResultStatus.Unauthorized,
                errorMessage: 'Unauthorized',
                data: null,
                extensions: [{field: 'refreshToken', message: 'Token not found'}],
            };
        }

        return {
            status: ResultStatus.Success,
            data: result,
            extensions: [],
        };
    },

    async generateAccessToken(userId: string): Promise<Result<string | null>> {

        const result = await jwtService.createAccessToken(userId);

        if (!result) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Unauthorized",
                extensions: [{field: 'accessToken', message: "Wrong userId"}]
            };
        }

        return {
            status: ResultStatus.Success,
            data: result,
            extensions: [],
        };
    },

    async generateRefreshToken(userId: string): Promise<Result<string | null>> {

        const result = await jwtService.createRefreshToken(userId);

        if (!result) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Unauthorized",
                extensions: [{field: 'refreshToken', message: "Wrong userId"}]
            };
        }

        return {
            status: ResultStatus.Success,
            data: result,
            extensions: [],
        };
    },

    async verifyRefreshToken(refreshToken: string): Promise<Result<string | null>> {

        const result = await jwtService.verifyRefreshToken(refreshToken);

        if (!result) {
            return {
                status: ResultStatus.Unauthorized,
                data: result,
                errorMessage: "Unauthorized",
                extensions: [{field: 'verifyRefreshToken', message: "Wrong refreshToken"}]
            };
        }

        return {
            status: ResultStatus.Success,
            data: result.userId,
            extensions: [],
        };
    },

    async setTokenValidToFalse(refreshToken: string): Promise<Result> {

        const result = await authRepository.setTokenValidToFalse(refreshToken);

        if (!result) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'NotFound',
                extensions: [{field: null, message: 'Comment not exist'}],
            }
        }

        return {
            status: ResultStatus.Success,
            data: null,
            extensions: [],
        }
    },

    async createTokensPair(userId: string): Promise<Result<{ accessToken: string, newRefreshToken: string } | null>> {
        const accessTokenResult = await this.generateAccessToken(userId);
        const refreshTokenResult = await this.generateRefreshToken(userId);

        if (accessTokenResult.status !== ResultStatus.Success || refreshTokenResult.status !== ResultStatus.Success) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Failed to generate tokens",
                extensions: []
            };
        }

        const saveResult = await this.saveRefreshToken(refreshTokenResult.data!);
        if (saveResult.status !== ResultStatus.NoContent) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: saveResult.errorMessage,
                extensions: saveResult.extensions
            };
        }

        return {
            status: ResultStatus.Success,
            data: { accessToken: accessTokenResult.data!, newRefreshToken: refreshTokenResult.data! },
            extensions: []
        };
    },

    async refreshSession(refreshToken: string): Promise<Result<{
        accessToken: string,
        newRefreshToken: string
    } | null>> {

        const tokenRecord = await this.findRefreshToken(refreshToken);
        const userIdResult = await this.verifyRefreshToken(refreshToken);

        if (tokenRecord.status !== ResultStatus.Success || userIdResult.status !== ResultStatus.Success) {
            return {
                status: userIdResult.status,
                data: null,
                errorMessage: userIdResult.errorMessage,
                extensions: userIdResult.extensions
            };
        }

        const invalidateResult = await this.setTokenValidToFalse(refreshToken);

        if (invalidateResult.status !== ResultStatus.Success) {
            return {
                status: invalidateResult.status,
                data: null,
                errorMessage: invalidateResult.errorMessage,
                extensions: invalidateResult.extensions
            };
        }

        return this.createTokensPair(userIdResult.data!);
    },

    async logout(refreshToken: string): Promise<Result> {

        const invalidateResult = await this.setTokenValidToFalse(refreshToken);

        if (invalidateResult.status !== ResultStatus.Success) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: 'Session not found or already inactive',
                extensions: []
            };
        }

        return {
            status: ResultStatus.NoContent,
            data: null,
            extensions: []
        };
    }
}