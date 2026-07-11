import { Request, Response, Router } from "express";
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
import { UserInputDto } from "../../user/types/input/user.input-dto";
import { RegistrationConfirmationCodeInput } from "../types/input/registration-confirmation-code.input";
import { RegistrationEmailResendingInput } from "../types/input/registration-email-resending.input";

export const authRouter = Router({});

const authController = container.get(AuthController)

// const userQueryRepository = container.get(UserQueryRepository);
// const authService = container.get(AuthService);

authRouter
    .get('/me',
        accessTokenGuard,
        // getMeHandler(userQueryRepository),
        // authController.getMe.bind(authController),
        (req, res) => authController.getMe(req, res),
    )

    .post('/login',
        rateLimitGuard,
        loginOrEmailValidation,
        inputValidationResultMiddleware,
        useragent.express(),
        // loginUserHandler(authService)
        // authController.loginUser.bind(authController),
        (req, res) => authController.loginUser(req, res),
    )

    .post('/registration',
        rateLimitGuard,
        userInputValidation,
        inputValidationResultMiddleware,
        // registrationHandler(authService),
        // authController.registration.bind(authController),
        (req: Request<{}, {}, UserInputDto>, res: Response) => authController.registration(req, res),
    )

    .post('/registration-confirmation',
        rateLimitGuard,
        confirmationCodeInputValidation,
        inputValidationResultMiddleware,
        // registrationConfirmationHandler(authService)
        // authController.registrationConfirmation.bind(authController),
        (req: Request<{}, {}, RegistrationConfirmationCodeInput>, res: Response) => authController.registrationConfirmation(req, res),
    )

    .post('/registration-email-resending',
        rateLimitGuard,
        emailInputValidation,
        inputValidationResultMiddleware,
        // registrationEmailResendingHandler(authService)
        // authController.registrationEmailResending.bind(authController),
        (req: Request<{}, {}, RegistrationEmailResendingInput>, res: Response) => authController.registrationEmailResending(req, res),
    )

    .post('/refresh-token',
        refreshTokenGuard,
        // refreshTokenHandler(authService)
        // authController.refreshToken.bind(authController),
        (req, res) => authController.refreshToken(req, res),
    )

    .post('/logout',
        refreshTokenGuard,
        // logoutHandler(authService)
        // authController.logout.bind(authController),
        (req, res) => authController.logout(req, res),
    )

    .post('/new-password',
        rateLimitGuard,
        newPasswordValidation,
        inputValidationResultMiddleware,
        // newPasswordHandler(authService)
        // authController.newPassword.bind(authController),
        (req, res) => authController.newPassword(req, res),
    )

    .post('/password-recovery',
        rateLimitGuard,
        emailValidation,
        inputValidationResultMiddleware,
        // passwordRecoveryHandler(authService)
        // authController.passwordRecovery.bind(authController),
        (req, res) => authController.passwordRecovery(req, res),
    )