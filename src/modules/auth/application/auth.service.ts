import { ResultStatus } from "../../../core/result/resultCode";
import { IUserDB } from "../../user/types/user.db.interface";
import { WithId } from "mongodb";
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

@injectable()
export class AuthService {

    constructor(
        @inject(JwtService) private jwtService: JwtService,
        @inject(BcryptService) private bcryptService: BcryptService,
        @inject(UserService) private usersService: UserService,
        @inject(UserRepository) private usersRepository: UserRepository,
        @inject(AuthRepository) private authRepository: AuthRepository,
        @inject(NodemailerService) private nodemailerService: NodemailerService,
        @inject(EmailExamples) private emailExamples: EmailExamples,
    ) {
    }

    async loginUser(loginOrEmail: string, password: string, browserName: string, clientIp: string): Promise<Result<TokensPair | null>> {

        const userCredentialsResult = await this.checkUserCredentials(loginOrEmail, password);

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

    async checkUserCredentials(loginOrEmail: string, password: string,): Promise<Result<WithId<IUserDB> | null>> {
        const user = await this.usersService.findByLoginOrEmail(loginOrEmail);

        if (!user)
            return {
                status: ResultStatus.NotFound_404,
                data: null,
                errorMessage: "Not Found",
                extensions: [{ field: loginOrEmail, message: "Not Found" }]
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
            status: ResultStatus.Success_200,
            data: user,
            extensions: [],
        };
    }

    async registerUser(login: string, password: string, email: string): Promise<Result<string | null>> {

        const userByLogin = await this.usersService.findByLoginOrEmail(login);
        const userByEmail = await this.usersService.findByLoginOrEmail(email);
        if (userByLogin || userByEmail) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: userByLogin ? 'login' : 'email', message: 'Already Registered' }],
            }
        }

        const passwordHash = await this.bcryptService.generateHash(password);

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

        const createdId = await this.usersRepository.create(newUser);

        this.nodemailerService //todo
            .sendEmail(
                newUser.email,
                newUser.emailConfirmation.confirmationCode,
                this.emailExamples.registrationEmail
            )
            .catch(er => console.error('error in send email:', er));

        return {
            status: ResultStatus.NoContent_204,
            data: createdId,
            extensions: [],
        };
    }

    async resendEmailConfirmationCode(email: string): Promise<Result<string | null>> {

        const userByEmail = await this.usersService.findByLoginOrEmail(email)

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

        await this.usersRepository.updateEmailConfirmationCode(email, confirmationCode, expirationDate);

        this.nodemailerService.sendEmail(
            email,
            confirmationCode,
            this.emailExamples.registrationEmail
        )
            .catch(e => console.error('error in send email:', e));


        return {
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: [],
        };
    }

    async sendPasswordRecoveryCode(email: string): Promise<Result<string | null>> {

        const userByEmail = await this.usersService.findByLoginOrEmail(email)
        if (!userByEmail) {
            return {
                status: ResultStatus.NoContent_204,
                data: null,
                extensions: [],
            }
        }

        const recoveryCode = randomUUID();
        const expirationDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        await this.usersRepository.updatePasswordRecoveryCode(email, recoveryCode, expirationDate);

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
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: [],
        };
    }

    async updatePassword(newPassword: string, recoveryCode: string): Promise<Result<boolean | null>> {
        const userResult = await this.usersService.findByRecoveryCode(recoveryCode);
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

        const newPasswordHash = await this.bcryptService.generateHash(newPassword);

        const isUpdatedResult = await this.usersService.updatePasswordAndClearRecovery(
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

        const result = await this.usersService.updateEmailConfirmationStatus(code);

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

        return tokensPairResult;
    }

    async deleteSession(deviceId: string): Promise<Result> {
        const isDeletedSession = await this.authRepository.deleteSession(deviceId);
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
            status: ResultStatus.Success_200,
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
        const expDate = new Date(refreshTokenPayload.exp * 1000);

        const session: Session = {
            user_id: sessionDto.userId,
            device_id: deviceId,
            iat: iatDate,
            browserName: sessionDto.browserName,
            ip: sessionDto.clientIp,
            exp: expDate,
        }

        await this.authRepository.saveSession(session);

        return {
            status: ResultStatus.Success_200,
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
            status: ResultStatus.Success_200,
            data: { accessToken, refreshToken },
            extensions: []
        };
    }
}