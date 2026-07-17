import { Router } from "express";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {
    emailValidation,
    loginOrEmailValidation,
    newPasswordValidation,
    userInputValidation,
} from "../../user/middlewares/user.input-dto.validation-middlewares";
import { accessTokenGuard } from "../middlewares/access-token.guard";
import { confirmationCodeInputValidation } from "../middlewares/confirmation-code.input-dto.validation-middleware";
import { emailInputValidation } from "../middlewares/email-resending.input-dto.validation-middleware";
import { refreshTokenGuard } from "../middlewares/refreshTokenGuard";
import useragent from "express-useragent";
import { rateLimitGuard } from "../middlewares/rate-limit.guard";
import { container } from "../../../composition-root";
import { AuthController } from "../controllers/auth.controller";

export const authRouter = Router({});

const authController = container.get(AuthController)

authRouter
    .get('/me',
        accessTokenGuard,
        authController.getMe.bind(authController),
    )

    .post('/login',
        rateLimitGuard,
        loginOrEmailValidation,
        inputValidationResultMiddleware,
        useragent.express(),
        authController.loginUser.bind(authController),
    )

    .post('/registration',
        rateLimitGuard,
        userInputValidation,
        inputValidationResultMiddleware,
        authController.registration.bind(authController),
    )

    .post('/registration-confirmation',
        rateLimitGuard,
        confirmationCodeInputValidation,
        inputValidationResultMiddleware,
        authController.registrationConfirmation.bind(authController),
    )

    .post('/registration-email-resending',
        rateLimitGuard,
        emailInputValidation,
        inputValidationResultMiddleware,
        authController.registrationEmailResending.bind(authController),
    )

    .post('/refresh-token',
        refreshTokenGuard,
        authController.refreshToken.bind(authController),
    )

    .post('/logout',
        refreshTokenGuard,
        authController.logout.bind(authController),
    )

    .post('/new-password',
        rateLimitGuard,
        newPasswordValidation,
        inputValidationResultMiddleware,
        authController.newPassword.bind(authController),
    )

    .post('/password-recovery',
        rateLimitGuard,
        emailValidation,
        inputValidationResultMiddleware,
        authController.passwordRecovery.bind(authController),
    )