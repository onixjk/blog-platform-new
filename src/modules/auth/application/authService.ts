import { UsersService } from "../../user/application/usersService";
import { ResultStatus } from "../../../core/result/resultCode";
import { IUserDB } from "../../user/types/user.db.interface";
import { WithId } from "mongodb";
import { Result } from "../../../core/result/result.type";
import { randomUUID } from "node:crypto";
import { UsersRepository } from "../../user/repositories/usersRepository";
import { AuthRepository } from "../repositories/auth.repository";
import { SessionDto } from "../types/session.dto";
import { Session } from "../types/session";
import { TokensPair } from "../types/tokensPair";
import { JwtService } from "../adapters/jwt.service";
import { BcryptService } from "../adapters/bcrypt.service";
import {
    authRepository,
    authService,
    bcryptService,
    emailExamples,
    jwtService,
    nodemailerService,
    usersRepository,
    usersService,
} from "../../../composition-root";


export class AuthService {

    constructor(
        public jwtService: JwtService,
        public bcryptService: BcryptService,
        public usersService: UsersService,
        public usersRepository: UsersRepository,
        public authRepository: AuthRepository,
    ) {
    }

    async loginUser(
        loginOrEmail: string,
        password: string,
        browserName: string,
        clientIp: string,
    ): Promise<Result<TokensPair | null>> {

        const userCredentialsResult = await authService.checkUserCredentials(loginOrEmail, password);

        if (userCredentialsResult.status !== ResultStatus.Success_200 || !userCredentialsResult.data) {
            return {
                status: ResultStatus.Unauthorized_401,
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
                status: ResultStatus.Unauthorized_401,
                errorMessage: 'Unauthorized',
                data: null,
                extensions: [{ field: null, message: 'Failed to save refresh token' }],
            };
        }

        const accessToken = createSessionResult.data.accessToken;
        const refreshToken = createSessionResult.data.refreshToken;

        return {
            status: ResultStatus.Success_200,
            data: { accessToken, refreshToken },
            extensions: [],
        };
    }

    async checkUserCredentials(
        loginOrEmail: string,
        password: string,
    ): Promise<Result<WithId<IUserDB> | null>> {
        const user = await usersService.findByLoginOrEmail(loginOrEmail);

        if (!user)
            return {
                status: ResultStatus.NotFound_404,
                data: null,
                errorMessage: "Not Found",
                extensions: [{ field: loginOrEmail, message: "Not Found" }]
            };

        const isPassCorrect = await bcryptService.checkPassword(password, user.passwordHash);

        if (!isPassCorrect)
            return {
                status: ResultStatus.Unauthorized_401,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{ field: 'password', message: 'Wrong password' }],
            };

        return {
            status: ResultStatus.Success_200,
            data: user,
            extensions: [],
        };
    }

    async registerUser(
        login: string,
        password: string,
        email: string
    ): Promise<Result<string | null>> {

        const userByLogin = await usersService.findByLoginOrEmail(login);
        const userByEmail = await usersService.findByLoginOrEmail(email);
        if (userByLogin || userByEmail) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: userByLogin ? 'login' : 'email', message: 'Already Registered' }],
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
            },
            passwordRecovery: {
                recoveryCode: null,
                expirationDate: null,
            }
        }

        const createdId = await usersRepository.create(newUser);

        nodemailerService //todo
            .sendEmail(
                newUser.email,
                newUser.emailConfirmation.confirmationCode,
                emailExamples.registrationEmail
            )
            .catch(er => console.error('error in send email:', er));

        return {
            status: ResultStatus.NoContent_204,
            data: createdId,
            extensions: [],
        };
    }

    async resendEmailConfirmationCode(email: string): Promise<Result<string | null>> {

        const userByEmail = await usersService.findByLoginOrEmail(email)

        if (!userByEmail) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'email', message: 'Invalid email' }],
            }
        }

        if (userByEmail.emailConfirmation.isConfirmed) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'email', message: 'Email confirmed' }],
            }
        }

        const confirmationCode = randomUUID();
        const expirationDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        await usersRepository.updateConfirmationCode(email, confirmationCode, expirationDate);

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
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: [],
        };
    }

    async resetPassword(email: string): Promise<Result<string | null>> {

        const userByEmail = await usersService.findByLoginOrEmail(email)
        if (!userByEmail || !userByEmail.emailConfirmation.isConfirmed) {
            return {
                status: ResultStatus.NoContent_204,
                data: null,
                extensions: [],
            }
        }

        const confirmationCode = randomUUID();
        const expirationDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        await usersRepository.updateConfirmationCode(email, confirmationCode, expirationDate);

        try {
            await nodemailerService.sendEmail(
                email,
                confirmationCode,
                emailExamples.passwordRecoveryEmail
            )
        } catch (e) {
            console.error('error in send email:', e);
        }

        return {
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: [],
        };
    }

    async updatePassword(newPassword: string, recoveryCode: string): Promise<Result<boolean | null>> {
        const userResult = await usersService.findByRecoveryCode(recoveryCode);
        if (
            !userResult.data ||
            !userResult.data.passwordRecovery.recoveryCode ||
            !userResult.data.passwordRecovery.expirationDate
        ) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'recoveryCode', message: 'Invalid or expired code' }],
            };
        }

        const newPasswordHash = await bcryptService.generateHash(newPassword);

        const isUpdatedResult = await usersService.updatePasswordAndClearRecovery(
            userResult.data._id.toString(),
            newPasswordHash
        );

        if (!isUpdatedResult.data) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: isUpdatedResult.extensions,
            };
        }

        return {
            status: ResultStatus.Success_200,
            data: isUpdatedResult.data,
            extensions: []
        };
    }

    async confirmEmail(code: string): Promise<Result> {

        const result = await usersService.updateEmailConfirmationStatus(code);

        if (!result) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'code', message: 'Incorrect code' }],
            };
        }

        return {
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: [],

        };
    }

    async refreshSession(userId: string, deviceId: string): Promise<Result<{
        accessToken: string;
        refreshToken: string
    } | null>> {

        const tokensPairResult = await authService._createTokensPair(userId, deviceId);
        if (!tokensPairResult.data) {
            return {
                status: ResultStatus.Unauthorized_401,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{ field: 'refreshToken', message: 'Refresh token is invalid or expired' }]
            };
        }

        const refreshTokenPayload = await jwtService.decodeToken(tokensPairResult.data.refreshToken);
        if (!refreshTokenPayload || typeof refreshTokenPayload.iat !== 'number') {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: null, message: 'Can\'t decode token' }],
            };
        }

        const iatDate = new Date(refreshTokenPayload.iat * 1000);
        const updateIatResult = await authRepository.updateIat(deviceId, iatDate);

        if (!updateIatResult) {
            return {
                status: ResultStatus.Unauthorized_401,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{ field: 'Iat', message: 'Can\'t update iat' }]
            };
        }

        return tokensPairResult;
    }

    async deleteSession(deviceId: string): Promise<Result> {
        const isDeletedSession = await authRepository.deleteSession(deviceId);
        if (!isDeletedSession) {
            return {
                status: ResultStatus.Unauthorized_401,
                errorMessage: 'Session not found or already inactive',
                data: null,
                extensions: [{ field: 'Session', message: 'Session not found or already inactive' }]
            };
        }

        return {
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: []
        };
    }

    async findSession(deviceId: string): Promise<Result<Session | null>> {
        const result = await authRepository.findSession(deviceId);

        if (!result) {
            return {
                status: ResultStatus.Unauthorized_401,
                errorMessage: 'Unauthorized',
                data: null,
                extensions: [{ field: 'Session', message: 'Session not found' }],
            };
        }

        return {
            status: ResultStatus.Success_200,
            data: result,
            extensions: [],
        };
    }

    async _createSession(sessionDto: SessionDto): Promise<Result<TokensPair | null>> {
        const deviceId = randomUUID();
        const tokensPairResult = await authService._createTokensPair(sessionDto.userId, deviceId)

        if (!tokensPairResult.data) {
            return {
                status: ResultStatus.Unauthorized_401,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{ field: 'refreshToken', message: 'Refresh token is invalid or expired' }]
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
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: null, message: 'Can\'t decode token' }],
            };
        }

        const iatDate = new Date(refreshTokenPayload.iat * 1000);
        const expDate = new Date(refreshTokenPayload.exp * 1000);

        const session: Session = {
            user_id: sessionDto.userId,
            device_id: deviceId,
            iat: iatDate,
            browserName: sessionDto.browserName,
            ip: sessionDto.clientIp,
            exp: expDate,
        }

        await authRepository.saveSession(session);

        return {
            status: ResultStatus.Success_200,
            data: { accessToken, refreshToken },
            extensions: [],
        };
    }

    async _createTokensPair(userId: string, deviceId: string): Promise<Result<TokensPair | null>> {

        const [accessToken, refreshToken] = await Promise.all([
            jwtService.createAccessToken(userId),
            jwtService.createRefreshToken(userId, deviceId),
        ]);

        if (!accessToken) {
            return {
                status: ResultStatus.Unauthorized_401,
                data: null,
                errorMessage: "Failed to generate access token",
                extensions: []
            };
        }

        if (!refreshToken) {
            return {
                status: ResultStatus.Unauthorized_401,
                data: null,
                errorMessage: "Failed to generate refresh token",
                extensions: []
            };
        }

        return {
            status: ResultStatus.Success_200,
            data: { accessToken, refreshToken },
            extensions: []
        };
    }
}