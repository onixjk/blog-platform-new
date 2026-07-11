import { UserQueryRepository } from "../../user/repositories/user.query.repository";
import { Request, Response } from "express";
import { HttpStatuses } from "../../../core/types/http-statuses";
import { inject } from "inversify";
import { AuthService } from "../application/auth.service";
import { LoginInputDto } from "../types/input/login.input-dto";
import { ResultStatus } from "../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../core/result/resultCodeToHttpException";
import { NewPasswordRecoveryInput } from "../types/input/new-password-recovery.input";
import { PasswordRecoveryInput } from "../types/input/password-recovery.input";
import { UserInputDto } from "../../user/types/input/user.input-dto";
import { errorsHandler } from "../../../core/errors/errors.handler";
import { RegistrationConfirmationCodeInput } from "../types/input/registration-confirmation-code.input";
import { RegistrationEmailResendingInput } from "../types/input/registration-email-resending.input";

export class AuthController {

    constructor(
        @inject(UserQueryRepository) private userQueryRepository: UserQueryRepository,
        @inject(AuthService) private authService: AuthService,
    ) {}

    async getMe(req: Request, res: Response) {

        const userId = req.user?.id as string;

        if (!userId) return res.sendStatus(HttpStatuses.Unauthorized_401);

        const me = await this.userQueryRepository.findMeById(userId);

        return res.status(HttpStatuses.Ok_200).send(me);
    }

    async loginUser(req: Request<{}, {}, LoginInputDto>, res: Response) {

        const { loginOrEmail, password } = req.body;
        const forwardedFor = req.headers['x-forwarded-for'];
        const clientIp = (Array.isArray(forwardedFor) ?
                forwardedFor[0] : forwardedFor?.split(',')[0].trim() ||
                req.socket.remoteAddress) ||
            'unknown clientIp';

        const browserName = req.useragent?.browser || 'Unknown Browser';
        const cookie_name = 'refreshToken';

        const result = await this.authService.loginUser(loginOrEmail, password, browserName, clientIp);

        if (result.status !== ResultStatus.Success_200) {
            res.clearCookie(cookie_name);
            return res.status(resultCodeToHttpException(result.status)).send(result.extensions);
        }

        res.cookie(cookie_name, result.data!.refreshToken, { httpOnly: true, secure: true })
        return res.status(HttpStatuses.Ok_200).send({ accessToken: result.data!.accessToken });
    }

    async logout(req: Request, res: Response) {

        const deviceId = req.deviceId;
        if (!deviceId) {
            return res.sendStatus(HttpStatuses.Unauthorized_401);
        }

        const result = await this.authService.deleteSession(deviceId);

        if (result.status !== ResultStatus.NoContent_204) {
            return res.sendStatus(HttpStatuses.Unauthorized_401);
        }

        res.clearCookie('refreshToken', { httpOnly: true, secure: true });
        res.sendStatus(HttpStatuses.NoContent_204);
    }

    async newPassword(req: Request<{}, {}, NewPasswordRecoveryInput>, res: Response) {
        const { newPassword, recoveryCode } = req.body;

        const result = await this.authService.updatePassword(newPassword, recoveryCode);

        if (result.status !== ResultStatus.Success_200)
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });

        return res.sendStatus(HttpStatuses.NoContent_204);
    }

    async passwordRecovery(req: Request<{}, {}, PasswordRecoveryInput>, res: Response) {
        const { email } = req.body;

        const result = await this.authService.sendPasswordRecoveryCode(email);

        if (result.status !== ResultStatus.NoContent_204)
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });

        return res.sendStatus(HttpStatuses.NoContent_204);
    }

    async refreshToken(req: Request, res: Response) {
        const cookie_name = 'refreshToken'
        const userId = req.user.id;
        const deviceId = req.deviceId;
        if (!userId || !deviceId) {
            return res.sendStatus(HttpStatuses.Unauthorized_401);
        }

        const result = await this.authService.refreshSession(userId, deviceId);

        if (result.status !== ResultStatus.Success_200 || !result.data) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });
        }

        res.cookie(cookie_name, result.data.refreshToken, { httpOnly: true, secure: true })
        return res.status(HttpStatuses.Ok_200).send({ accessToken: result.data.accessToken });
    }

    async registration(req: Request<{}, {}, UserInputDto>, res: Response) {
        try {
            const { login, password, email } = req.body;

            const result = await this.authService.registerUser(login, password, email);

            if (result.status !== ResultStatus.NoContent_204)
                return res
                    .status(resultCodeToHttpException(result.status))
                    .send({ errorsMessages: result.extensions });

            return res.status(HttpStatuses.NoContent_204).send(result.data);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async registrationConfirmation(req: Request<{}, {}, RegistrationConfirmationCodeInput>, res: Response) {
        const { code } = req.body

        if (!code) {
            return res
                .status(HttpStatuses.BadRequest_400)
                .send({ errorsMessages: [{ field: 'code', message: 'Code is required' }] });
        }

        const result = await this.authService.confirmEmail(code);

        if (result.status !== ResultStatus.NoContent_204)
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });

        return res.status(HttpStatuses.NoContent_204).send(result.data);
    }

    async registrationEmailResending(req: Request<{}, {}, RegistrationEmailResendingInput>, res: Response) {
        const { email } = req.body;

        const result = await this.authService.resendEmailConfirmationCode(email)

        if (result.status !== ResultStatus.NoContent_204)
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });

        return res.status(HttpStatuses.NoContent_204).send(result.data);
    }
}