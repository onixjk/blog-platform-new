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
import {SessionDto} from "../types/session.dto";
import {Session} from "../types/session";
import {TokensPair} from "../types/tokensPair";
import {Device} from "../../modules/device/types/device.";


export const authService = {
    async loginUser(
        loginOrEmail: string,
        password: string,
        browserName: string,
        clientIp: string,
    ): Promise<Result<TokensPair | null>> {

        const userCredentialsResult = await authService.checkUserCredentials(loginOrEmail, password);

        if (userCredentialsResult.status !== ResultStatus.Success || !userCredentialsResult.data) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Unauthorized",
                extensions: [{ field: loginOrEmail, message: "Wrong credentials" }]
            };
        }

        const userId = userCredentialsResult.data._id.toString()

        const sessionDto: SessionDto = {
            userId: userId,
            browserName: browserName,
            clientIp: clientIp,
        }

        const createSessionResult = await this._createSession(sessionDto);

        if (!createSessionResult.data) {
            return {
                status: ResultStatus.Unauthorized,
                errorMessage: 'Unauthorized',
                data: null,
                extensions: [{field: null, message: 'Failed to save refresh token'}],
            };
        }

        const accessToken = createSessionResult.data.accessToken;
        const refreshToken = createSessionResult.data.refreshToken;

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
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: 'Unauthorized',
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

    async refreshSession(userId: string, deviceId: string): Promise<Result<{
        accessToken: string;
        refreshToken: string
    } | null>> {

        const tokensPairResult = await this._createTokensPair(userId, deviceId);
        if (!tokensPairResult.data) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{field: 'refreshToken', message: 'Refresh token is invalid or expired'}]
            };
        }

        const refreshTokenPayload = await jwtService.decodeToken(tokensPairResult.data.refreshToken);
        if (!refreshTokenPayload || typeof refreshTokenPayload.iat !== 'number') {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{field: null, message: 'Can\'t decode token'}],
            };
        }

        const newDeviceId = refreshTokenPayload.deviceId;
        const iat = refreshTokenPayload.iat.toString();
        const updateIatResult = await authRepository.updateIat(newDeviceId, iat);

        if (!updateIatResult) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{field: 'Iat', message: 'Can\'t update iat'}]
            };
        }

        return tokensPairResult;
    },

    async deleteSession(deviceId: string): Promise<Result> {
        const isDeletedSession = await authRepository.deleteSession(deviceId);
        if (!isDeletedSession) {
            return {
                status: ResultStatus.Unauthorized,
                errorMessage: 'Session not found or already inactive',
                data: null,
                extensions: [{field: 'Session', message: 'Session not found or already inactive'}]
            };
        }

        return {
            status: ResultStatus.NoContent,
            data: null,
            extensions: []
        };
    },

    async findSession(refreshToken: string): Promise<Result<Session | null>> {
        const result = await authRepository.findSession(refreshToken);

        if (!result) {
            return {
                status: ResultStatus.Unauthorized,
                errorMessage: 'Unauthorized',
                data: null,
                extensions: [{field: 'Session', message: 'Session not found'}],
            };
        }

        return {
            status: ResultStatus.Success,
            data: result,
            extensions: [],
        };
    },

    async findActiveDevices(userId: string): Promise<Result<Device[]>> {
        const sessions = await authRepository.findAllUserSessions(userId);

        const devices: Device[] = sessions.map(session => {
            const lastActiveDate = new Date(Number(session.iat) * 1000).toISOString();

            return {
                ip: session.ip,
                title: session.browserName,
                lastActiveDate: lastActiveDate,
                deviceId: session.device_id
            };
        });

        return {
            status: ResultStatus.Success,
            data: devices,
            extensions: []
        };
    },

    async _createSession(sessionDto: SessionDto): Promise<Result<TokensPair | null>> {
        const deviceId = randomUUID();
        const tokensPairResult = await this._createTokensPair(sessionDto.userId, deviceId)

        if (!tokensPairResult.data) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{field: 'refreshToken', message: 'Refresh token is invalid or expired'}]
            };
        }

        const accessToken = tokensPairResult.data.accessToken;
        const refreshToken = tokensPairResult.data.refreshToken;

        const refreshTokenPayload = await jwtService.decodeToken(tokensPairResult.data.refreshToken);

        if (!refreshTokenPayload ||
            typeof refreshTokenPayload.exp !== 'number' ||
            typeof refreshTokenPayload.iat !== 'number'
        ) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{field: null, message: 'Can\'t decode token'}],
            };
        }

        const iat = refreshTokenPayload.iat.toString();
        const exp = refreshTokenPayload.exp.toString();

        const session: Session = {
            user_id: sessionDto.userId,
            device_id: deviceId,
            iat: iat,
            browserName: sessionDto.browserName,
            ip: sessionDto.clientIp,
            exp: exp,
        }

        await authRepository.saveSession(session);

        return {
            status: ResultStatus.Success,
            data: {accessToken, refreshToken},
            extensions: [],
        };
    },

    async _createTokensPair(userId: string, deviceId: string): Promise<Result<TokensPair | null>> {

        const [accessToken, refreshToken] = await Promise.all([
            jwtService.createAccessToken(userId),
            jwtService.createRefreshToken(userId, deviceId),
        ]);

        if (!accessToken) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Failed to generate access token",
                extensions: []
            };
        }

        if (!refreshToken) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Failed to generate refresh token",
                extensions: []
            };
        }

        return {
            status: ResultStatus.Success,
            data: {accessToken, refreshToken},
            extensions: []
        };
    },
}