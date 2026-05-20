import {Router} from "express";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {loginUserHandler} from "./handlers/login-user.handler";
import {loginOrEmailValidation} from "../../modules/user/middlewares/user.input-dto.validation-middlewares";
import {accessTokenGuard} from "../middlewares/access.token.guard";
import {getCurrentUserHandler} from "./handlers/get-current-user.handler";

export const authRouter = Router({});

authRouter
    .get('/auth/me',
        accessTokenGuard,
        getCurrentUserHandler,
    )
    .post('/login',
        loginOrEmailValidation,
        inputValidationResultMiddleware,
        loginUserHandler
    )