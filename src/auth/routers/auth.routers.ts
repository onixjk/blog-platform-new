import { Router } from "express";
import { inputValidationResultMiddleware } from "../../core/middlewares/validation/input-validation-result.middleware";
import { loginUserHandler } from "./handlers/post-login-user.handler";
import {
    loginOrEmailValidation,
    userInputValidation
} from "../../modules/user/middlewares/user.input-dto.validation-middlewares";
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

export const authRouter = Router({});

authRouter
    .get('/me',
        accessTokenGuard,
        getMeHandler,
    )

    .post('/login',
        rateLimitGuard,
        loginOrEmailValidation,
        inputValidationResultMiddleware,
        useragent.express(),
        loginUserHandler
    )

    .post('/registration',
        // rateLimitGuard,
        userInputValidation,
        inputValidationResultMiddleware,
        registrationHandler,
    )

    .post('/registration-confirmation',
        // rateLimitGuard,
        confirmationCodeInputValidation,
        inputValidationResultMiddleware,
        registrationConfirmationHandler
    )

    .post('/registration-email-resending',
        // rateLimitGuard,
        emailInputValidation,
        inputValidationResultMiddleware,
        registrationEmailResendingHandler
    )

    .post('/refresh-token',
        refreshTokenGuard,
        refreshTokenHandler
    )

    .post('/logout',
        refreshTokenGuard,
        logoutHandler
    )
