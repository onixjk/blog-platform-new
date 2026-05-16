import {Router} from "express";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {loginUserHandler} from "./handlers/login-user.handler";
import {loginOrEmailValidation} from "../../modules/user/routers/user.input-dto.validation-middlewares";

export const authRouter = Router({});

authRouter
    .post('/login',
        loginOrEmailValidation,
        inputValidationResultMiddleware,
        loginUserHandler
    )