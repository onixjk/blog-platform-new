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
        browserName: string,
        clientIp: string,
    ): Promise<Result<{ accessToken: string, refreshToken: string } | null>> {

        const userCredentialsResult = await authService.checkUserCredentials(loginOrEmail, password);

        if (userCredentialsResult.status !== ResultStatus.Success) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Unauthorized",
                extensions: [{field: loginOrEmail, message: "Wrong credentials"}]
            };
        }

        const deviceId = randomUUID();

        const [accessToken, refreshToken] = await Promise.all([
            jwtService.createAccessToken(userCredentialsResult.data!._id.toString()),
            jwtService.createRefreshToken(userCredentialsResult.data!._id.toString(), deviceId),
        ]);

        // const accessToken = await jwtService.createAccessToken(userCredentialsResult.data!._id.toString());
        // const refreshToken = await jwtService.createRefreshToken(userCredentialsResult.data!._id.toString());

        const saveResult = await this.createSession(refreshToken);

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

    async createSession(session: string): Promise<Result> {
        const deviceId = this.uuidService.generate();
        const tokens = this.createTokensPair()

        const accessToken = generateAccessToken({ userId });
        const refreshToken = generateRefreshToken({ userId, deviceId });

        const expiredAt = this.jwtService.getExpirationDate(refreshToken);

        await this.securityDevicesRepository.createSession({
            userId,
            deviceId,
            ip: clientIp,
            title: browserName,
            expiredAt,
            createdAt: new Date()
        });

        return { accessToken, refreshToken };

//////////////////////////////////////////////////////////////////////////

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

    async generateRefreshToken(userId: string, deviceId: string): Promise<Result<string | null>> {

        const result = await jwtService.createRefreshToken(userId, deviceId);

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

    async verifyRefreshToken(refreshToken: string): Promise<Result<{ userId: string, deviceId: string } | null>> {

        const result = await jwtService.verifyRefreshToken(refreshToken);

        if (!result || !result.userId || !result.deviceId) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Unauthorized",
                extensions: [{field: 'verifyRefreshToken', message: "Wrong refreshToken"}]
            };
        }

        return {
            status: ResultStatus.Success,
            data: result,
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
                extensions: [{field: null, message: 'Refresh token not found'}],
            }
        }

        return {
            status: ResultStatus.Success,
            data: null,
            extensions: [],
        }
    },

    async createTokensPair(userId: string, deviceId: string): Promise<Result<{
        accessToken: string,
        refreshToken: string
    } | null>> {

        const [accessTokenResult, refreshTokenResult] = await Promise.all([
            this.generateAccessToken(userId),
            this.generateRefreshToken(userId, deviceId),
        ]);

        if (accessTokenResult.status !== ResultStatus.Success || !accessTokenResult.data) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Failed to generate access token", // Уточняем ошибку
                extensions: []
            };
        }

        if (refreshTokenResult.status !== ResultStatus.Success || !refreshTokenResult.data) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Failed to generate refresh token", // Уточняем ошибку
                extensions: []
            };
        }

        return {
            status: ResultStatus.Success,
            data: {
                accessToken: accessTokenResult.data,
                refreshToken: refreshTokenResult.data
            },
            extensions: []
        };
    },

    async refreshSession(refreshToken: string): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {

        const verifyRefreshTokenResult = await authService.verifyRefreshToken(refreshToken);

        if (verifyRefreshTokenResult.status !== ResultStatus.Success) {
            return {
                status: verifyRefreshTokenResult.status,
                data: null,
                errorMessage: verifyRefreshTokenResult.errorMessage,
                extensions: verifyRefreshTokenResult.extensions
            };
        }

        const tokenRecord = await authService.findRefreshToken(refreshToken);

        if (tokenRecord.status !== ResultStatus.Success) {
            return {
                status: tokenRecord.status,
                data: null,
                errorMessage: tokenRecord.errorMessage,
                extensions: tokenRecord.extensions
            };
        }

        const tokensPairResult = await authService.createTokensPair(
            verifyRefreshTokenResult.data!.userId,
            verifyRefreshTokenResult.data!.deviceId
        );

        if (tokensPairResult.status !== ResultStatus.Success) {
            return {
                status: tokensPairResult.status,
                data: null,
                errorMessage: tokensPairResult.errorMessage,
                extensions: tokensPairResult.extensions
            };
        }

        const invalidateResult = await authService.setTokenValidToFalse(refreshToken);

        if (invalidateResult.status !== ResultStatus.Success) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: invalidateResult.errorMessage,
                extensions: invalidateResult.extensions
            };
        }

        return tokensPairResult;
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
    },

    async saveResult(refreshToken: string): Promise<Result> {


        return {
            status: ResultStatus.NoContent,
            data: null,
            extensions: []
        };
    }
}