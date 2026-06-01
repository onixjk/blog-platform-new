import {Router} from "express";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {loginUserHandler} from "./handlers/login-user.handler";
import {
    loginOrEmailValidation,
    userInputValidation
} from "../../modules/user/middlewares/user.input-dto.validation-middlewares";
import {accessTokenGuard} from "../middlewares/access.token.guard";
import {getMeHandler} from "./handlers/get-me.handler";
import {registrationHandler} from "./handlers/post-registration.handler";
import {registrationConfirmationHandler} from "./handlers/post-registration-confirmation.handler";
import {registrationEmailResendingHandler} from "./handlers/post-registration-email-resending.handler";
import {confirmationCodeInputValidation} from "../middlewares/confirmation-code.input-dto.validation-middleware";
import {emailInputValidation} from "../middlewares/email-resending.input-dto.validation-middleware";

export const authRouter = Router({});

authRouter
    .get('/me',
        accessTokenGuard,
        getMeHandler,
    )

    .post('/login',
        loginOrEmailValidation,
        inputValidationResultMiddleware,
        loginUserHandler
    )

    .post('/registration',
        userInputValidation,
        inputValidationResultMiddleware,
        registrationHandler,
    )

    .post('/registration-confirmation',
        confirmationCodeInputValidation,
        inputValidationResultMiddleware,
        registrationConfirmationHandler
    )

    .post('/registration-email-resending',
        emailInputValidation,
        inputValidationResultMiddleware,
        registrationEmailResendingHandler
    )
