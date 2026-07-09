import { Router } from "express";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { loginUserHandler } from "./handlers/post-login-user.handler";
import {
    emailValidation,
    loginOrEmailValidation,
    newPasswordValidation,
    userInputValidation,
} from "../../user/middlewares/user.input-dto.validation-middlewares";
import { accessTokenGuard } from "../middlewares/access-token.guard";
import { getMeHandler } from "./handlers/get-me.handler";
import { registrationHandler } from "./handlers/post-registration.handler";
import { registrationConfirmationHandler } from "./handlers/post-registration-confirmation.handler";
import { registrationEmailResendingHandler } from "./handlers/post-registration-email-resending.handler";
import { confirmationCodeInputValidation } from "../middlewares/confirmation-code.input-dto.validation-middleware";
import { emailInputValidation } from "../middlewares/email-resending.input-dto.validation-middleware";
import { refreshTokenGuard } from "../middlewares/refreshTokenGuard";
import { refreshTokenHandler } from "./handlers/post-refresh-token.handler";
import { logoutHandler } from "./handlers/post-logout.handler";
import useragent from "express-useragent";
import { rateLimitGuard } from "../middlewares/rate-limit.guard";
import { passwordRecoveryHandler } from "./handlers/post-password-recovery.handler";
import { newPasswordHandler } from "./handlers/post-new-password.handler";
import { container } from "../../../composition-root";
import { UserQueryRepository } from "../../user/repositories/user.query.repository";
import { AuthService } from "../application/auth.service";

export const authRouter = Router({});

const userQueryRepository = container.get(UserQueryRepository);
const authService = container.get(AuthService);

authRouter
    .get('/me',
        accessTokenGuard,
        getMeHandler(userQueryRepository),
    )

    .post('/login',
        rateLimitGuard,
        loginOrEmailValidation,
        inputValidationResultMiddleware,
        useragent.express(),
        loginUserHandler(authService)
    )

    .post('/registration',
        rateLimitGuard,
        userInputValidation,
        inputValidationResultMiddleware,
        registrationHandler(authService),
    )

    .post('/registration-confirmation',
        rateLimitGuard,
        confirmationCodeInputValidation,
        inputValidationResultMiddleware,
        registrationConfirmationHandler(authService)
    )

    .post('/registration-email-resending',
        rateLimitGuard,
        emailInputValidation,
        inputValidationResultMiddleware,
        registrationEmailResendingHandler(authService)
    )

    .post('/refresh-token',
        refreshTokenGuard,
        refreshTokenHandler(authService)
    )

    .post('/logout',
        refreshTokenGuard,
        logoutHandler(authService)
    )

    .post('/new-password',
        rateLimitGuard,
        newPasswordValidation,
        inputValidationResultMiddleware,
        newPasswordHandler(authService)
    )

    .post('/password-recovery',
        rateLimitGuard,
        emailValidation,
        inputValidationResultMiddleware,
        passwordRecoveryHandler(authService)
    )