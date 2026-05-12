import {userInputValidation} from "../../modules/user/routers/user.input-dto.validation-middlewares";
import {Router} from "express";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation-result.middleware";

export const authRouter = Router({});

authRouter
    .post('/auth/login',
        userInputValidation,
        inputValidationResultMiddleware,


    )