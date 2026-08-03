import { ResultStatus } from "../../../core/result/resultCode";
import { Result } from "../../../core/result/result.type";
import { randomUUID } from "node:crypto";
import { AuthRepository } from "../repositories/auth.repository";
import { SessionDto } from "../types/session.dto";
import { Session } from "../types/session";
import { TokensPair } from "../types/tokensPair";
import { JwtService } from "../adapters/jwt.service";
import { BcryptService } from "../adapters/bcrypt.service";
import { NodemailerService } from "../adapters/nodemailer.service";
import { EmailExamples } from "../adapters/email-examples";
import { inject, injectable } from "inversify";
import { UserService } from "../../user/application/user.service";
import { UserRepository } from "../../user/repositories/user.repository";
import { SessionModel } from "../../../db/mongo.db";

@injectable()
export class AuthService {

    constructor(
        @inject(JwtService) private jwtService: JwtService,
        @inject(BcryptService) private bcryptService: BcryptService,
        @inject(UserService) private userService: UserService,
        @inject(UserRepository) private userRepository: UserRepository,
        @inject(AuthRepository) private authRepository: AuthRepository,
        @inject(NodemailerService) private nodemailerService: NodemailerService,
        @inject(EmailExamples) private emailExamples: EmailExamples,
    ) {}

    //todo session
    async loginUser(loginOrEmail: string, password: string, browserName: string, clientIp: string): Promise<Result<TokensPair | null>> {

        const user = await this.userRepository.findByLoginOrEmail(loginOrEmail);
        if (!user) return {
            status: ResultStatus.Unauthorized_401,
            data: null,
            errorMessage: "Unauthorized",
            extensions: [{ field: 'loginOrEmail', message: "Wrong credentials" }]
        };

        const isPassCorrect = await this.bcryptService.checkPassword(password, user.passwordHash);
        if (!isPassCorrect) return {
            status: ResultStatus.Unauthorized_401,
            data: null,
            errorMessage: 'Unauthorized',
            extensions: [{ field: 'password', message: 'Wrong password' }],
        };


        const userId = user._id.toString();

        const sessionDto: SessionDto = {
            userId: userId,
            browserName: browserName,
            clientIp: clientIp,
        }

        const createSessionResult = await this._createSession(sessionDto);

        if (!createSessionResult.data) return {
            status: ResultStatus.Unauthorized_401,
            errorMessage: 'Unauthorized',
            data: null,
            extensions: [{ field: null, message: 'Failed to save refresh token' }],
        };

        const accessToken = createSessionResult.data.accessToken;
        const refreshToken = createSessionResult.data.refreshToken;

        return {
            status: ResultStatus.Success,
            data: { accessToken, refreshToken },
            extensions: [],
        };
    }

    async registerUser(login: string, password: string, email: string): Promise<Result<string | null>> {

        const createdUserId = await this.userService.create({ login, password, email })
        if (createdUserId.status !== ResultStatus.Success || !createdUserId.data) {
            return {
                status: createdUserId.status,
                errorMessage: createdUserId.errorMessage,
                data: null,
                extensions: createdUserId.extensions,
            };
        }

        const user = await this.userRepository.findById(createdUserId.data)
        if (!user) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'Bad Request',
            data: null,
            extensions: [{ field: 'User', message: 'User registration failed' }],
        };

        await this.nodemailerService
            .sendEmail(
                user.email,
                user.emailConfirmation.confirmationCode,
                this.emailExamples.registrationEmail
            )
            .catch(er => console.error('error in send email:', er));

        return {
            status: ResultStatus.Success,
            data: createdUserId.data,
            extensions: [],
        };
    }

    async resendConfirmationCode(email: string): Promise<Result<string | null>> {

        const user = await this.userRepository.findByLoginOrEmail(email)
        if (!user) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'Bad Request',
            data: null,
            extensions: [{ field: 'email', message: 'Invalid email' }],
        }

        if (user.emailConfirmation.isConfirmed) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'Bad Request',
            data: null,
            extensions: [{ field: 'email', message: 'Email confirmed' }],
        }

        const confirmationCode = randomUUID();

        const isUpdated = user.updateConfirmationCode(confirmationCode)
        if (!isUpdated) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'Bad Request',
            data: null,
            extensions: [{ field: 'email', message: 'Email already confirmed' }],
        };

        const isSaved = await this.userRepository.save(user);
        if (!isSaved) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'Database error',
            data: null,
            extensions: [{ field: 'user', message: 'Failed to update user in database' }],
        };

        this.nodemailerService.sendEmail(
            email,
            confirmationCode,
            this.emailExamples.registrationEmail
        )
            .catch(e => console.error('error in send email:', e));

        return {
            status: ResultStatus.Success,
            data: null,
            extensions: [],
        };
    }

    async sendPasswordRecoveryCode(email: string): Promise<Result<string | null>> {

        const user = await this.userRepository.findByLoginOrEmail(email)
        if (!user) return {
            status: ResultStatus.Success,
            data: null,
            extensions: [],
        }

        const recoveryCode = randomUUID();

        user.updateRecoveryCode(recoveryCode);

        const isSavedUserId = await this.userRepository.save(user);
        if (!isSavedUserId) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'BadRequest',
            data: null,
            extensions: [{ field: 'Email', message: 'Failed to generate recovery code' }],
        };

        try {
            await this.nodemailerService.sendEmail(
                email,
                recoveryCode,
                this.emailExamples.passwordRecoveryEmail
            )
        } catch (e) {
            console.error('error in send email:', e);
        }

        return {
            status: ResultStatus.Success,
            data: null,
            extensions: [],
        };
    }

    async updatePassword(newPassword: string, recoveryCode: string): Promise<Result<boolean | null>> {
        const user = await this.userRepository.findByRecoveryCode(recoveryCode);
        if (!user) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'Bad Request',
            data: null,
            extensions: [{ field: 'recoveryCode', message: 'Invalid or expired code' }],
        };

        const newPasswordHash = await this.bcryptService.generateHash(newPassword);

        const isUpdated = user.updatePasswordAndClearRecovery(newPasswordHash);
        if (!isUpdated) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'Bad Request',
            data: null,
            extensions: [{ field: 'recoveryCode', message: 'Failed to update password.' }],
        };

        const savedUserId = await this.userRepository.save(user);
        if (!savedUserId) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'Bad Request',
            data: null,
            extensions: [{ field: 'User', message: 'Failed to save new password to database.' }],
        };

        return {
            status: ResultStatus.Success,
            data: isUpdated,
            extensions: []
        };
    }

    async confirmEmail(code: string): Promise<Result<boolean>> {

        const user = await this.userRepository.findByConfirmationCode(code);
        if (!user) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'User not found',
            data: false,
            extensions: [{ field: 'code', message: 'Confirmation code is invalid' }]
        };

        const isConfirmedSuccessfully = user.confirmEmail(code,);
        if (!isConfirmedSuccessfully) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'Verification failed',
            data: false,
            extensions: [{ field: 'code', message: 'Code is expired, invalid or already confirmed' }]
        };

        await this.userRepository.save(user);

        return {
            status: ResultStatus.Success,
            data: true,
            extensions: []
        };
    }


    //todo переписать на DDD
    async refreshSession(userId: string, deviceId: string): Promise<Result<TokensPair | null>> {

        const tokensPairResult = await this._createTokensPair(userId, deviceId);
        if (!tokensPairResult.data) {
            return {
                status: ResultStatus.Unauthorized_401,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{ field: 'refreshToken', message: 'Refresh token is invalid or expired' }]
            };
        }

        const refreshTokenPayload = await this.jwtService.decodeToken(tokensPairResult.data.refreshToken);
        if (!refreshTokenPayload || typeof refreshTokenPayload.iat !== 'number') {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: null, message: 'Can\'t decode token' }],
            };
        }

        const iatDate = new Date(refreshTokenPayload.iat * 1000);
        const updateIatResult = await this.authRepository.updateIat(deviceId, iatDate);
        if (!updateIatResult) {
            return {
                status: ResultStatus.Unauthorized_401,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{ field: 'Iat', message: 'Can\'t update iat' }]
            };
        }

        return {
            status: ResultStatus.Success,
            data: tokensPairResult.data,
            extensions: [],
        };
    }

    async deleteSession(deviceId: string): Promise<Result> {

        const isDeletedSession = await this.authRepository.delete(deviceId);
        if (!isDeletedSession) {
            return {
                status: ResultStatus.Unauthorized_401,
                errorMessage: 'Session not found or already inactive',
                data: null,
                extensions: [{ field: 'Session', message: 'Session not found or already inactive' }]
            };
        }

        return {
            status: ResultStatus.Success,
            data: null,
            extensions: []
        };
    }

    async findSession(deviceId: string): Promise<Result<Session | null>> {
        const result = await this.authRepository.findSession(deviceId);

        if (!result) {
            return {
                status: ResultStatus.Unauthorized_401,
                errorMessage: 'Unauthorized',
                data: null,
                extensions: [{ field: 'Session', message: 'Session not found' }],
            };
        }

        return {
            status: ResultStatus.Success,
            data: result,
            extensions: [],
        };
    }

    async _createSession(sessionDto: SessionDto): Promise<Result<TokensPair | null>> {
        const deviceId = randomUUID();
        const tokensPairResult = await this._createTokensPair(sessionDto.userId, deviceId)

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

        const refreshTokenPayload = await this.jwtService.decodeToken(tokensPairResult.data.refreshToken);

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
        const expireDate = new Date(refreshTokenPayload.exp * 1000);

        const newSession = new SessionModel({
            user_id: sessionDto.userId,
            device_id: deviceId,
            iat: iatDate,
            browserName: sessionDto.browserName,
            ip: sessionDto.clientIp,
            exp: expireDate,
        });

        await this.authRepository.save(newSession);

        return {
            status: ResultStatus.Success,
            data: { accessToken, refreshToken },
            extensions: [],
        };
    }

    async _createTokensPair(userId: string, deviceId: string): Promise<Result<TokensPair | null>> {

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.createAccessToken(userId),
            this.jwtService.createRefreshToken(userId, deviceId),
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
            status: ResultStatus.Success,
            data: { accessToken, refreshToken },
            extensions: []
        };
    }
}