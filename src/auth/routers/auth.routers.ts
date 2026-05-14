import {userInputValidation} from "../../modules/user/routers/user.input-dto.validation-middlewares";
import {Router} from "express";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";
import {createTokenHandler} from "./handlers/create-token.handler";

export const authRouter = Router({});

authRouter
    .post('/login',
        userInputValidation,
        inputValidationResultMiddleware,
        createTokenHandler
    )