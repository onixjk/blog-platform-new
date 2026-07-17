import { ResultStatus } from "../../../core/result/resultCode";
import { IUserDB } from "../../user/types/user.db.interface";
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
import { HydratedDocument } from "mongoose";

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

    async loginUser(loginOrEmail: string, password: string, browserName: string, clientIp: string): Promise<Result<TokensPair | null>> {

        const userCredentialsResult = await this.checkUserCredentials(loginOrEmail, password);
        if (userCredentialsResult.status !== ResultStatus.Success || !userCredentialsResult.data) {
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
            status: ResultStatus.Success,
            data: { accessToken, refreshToken },
            extensions: [],
        };
    }

    async checkUserCredentials(loginOrEmail: string, password: string,): Promise<Result<HydratedDocument<IUserDB> | null>> {
        const user = await this.userRepository.findByLoginOrEmail(loginOrEmail);
        if (!user)
            return {
                status: ResultStatus.Unauthorized_401,
                data: null,
                errorMessage: "Unauthorized",
                extensions: [{ field: 'loginOrEmail', message: "Wrong credentials" }]
            };

        const isPassCorrect = await this.bcryptService.checkPassword(password, user.passwordHash);
        if (!isPassCorrect)
            return {
                status: ResultStatus.Unauthorized_401,
                data: null,
                errorMessage: 'Unauthorized',
                extensions: [{ field: 'password', message: 'Wrong password' }],
            };

        return {
            status: ResultStatus.Success,
            data: user,
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

        const newUser = await this.userRepository.findById(createdUserId.data)
        if (!newUser) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'User', message: 'User registration failed' }],
            };
        }

        try {
            await this.nodemailerService.sendEmail(
                newUser.email,
                newUser.emailConfirmation.confirmationCode,
                this.emailExamples.registrationEmail
            );
        } catch (e) {
            console.error('error in send email:', e);
        }

        // await this.nodemailerService //todo
        //     .sendEmail(
        //         newUser.email,
        //         newUser.emailConfirmation.confirmationCode,
        //         this.emailExamples.registrationEmail
        //     )
        //     .catch(er => console.error('error in send email:', er));

        return {
            status: ResultStatus.Success,
            data: createdUserId.data,
            extensions: [],
        };
    }

    async resendEmailConfirmationCode(email: string): Promise<Result<string | null>> {

        const userByEmail = await this.userRepository.findByLoginOrEmail(email)
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

        await this.userRepository.updateEmailConfirmationCode(email, confirmationCode, expirationDate);

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

        const userByEmail = await this.userRepository.findByLoginOrEmail(email)
        if (!userByEmail) {
            return {
                status: ResultStatus.Success,
                data: null,
                extensions: [],
            }
        }

        const recoveryCode = randomUUID();
        const expirationDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        const isUpdateRecoveryCode = await this.userRepository.updatePasswordRecoveryCode(email, recoveryCode, expirationDate);
        if (!isUpdateRecoveryCode) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'BadRequest',
                data: null,
                extensions: [{ field: 'Email', message: 'Invalid email' }],
            };
        }

        try { //todo
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
        const userResult = await this.userRepository.findByRecoveryCode(recoveryCode);
        if (!userResult ||
            !userResult.passwordRecovery.recoveryCode ||
            !userResult.passwordRecovery.expirationDate
        ) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'recoveryCode', message: 'Invalid or expired code' }],
            };
        }

        const newPasswordHash = await this.bcryptService.generateHash(newPassword);

        const isUpdatedResult = await this.userRepository.updatePasswordAndClearRecovery(
            userResult._id.toString(),
            newPasswordHash
        );
        if (!isUpdatedResult) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'recoveryCode', message: 'Failed to update password.' }],
            };
        }

        return {
            status: ResultStatus.Success,
            data: isUpdatedResult,
            extensions: []
        };
    }

    async confirmEmail(code: string): Promise<Result> {

        const isUpdate = await this.userService.updateEmailConfirmationStatus(code);
        if (isUpdate.status !== ResultStatus.Success) {
            return {
                status: isUpdate.status,
                errorMessage: isUpdate.errorMessage,
                data: null,
                extensions: isUpdate.extensions,
            };
        }

        return {
            status: ResultStatus.Success,
            data: null,
            extensions: [],
        };
    }

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