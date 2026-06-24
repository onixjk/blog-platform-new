import { Router } from "express";
import { deviceIdValidation, idValidation } from "../../../core/middlewares/validation/params-id.validation-middleware";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { accessTokenGuard } from "../../../auth/middlewares/access-token.guard";
import { commentInputValidation } from "../../comment/middlewares/comment.input-dto.validation-middlewares";
import { getDeviceListHandler } from "./handlers/get-device-list.handler";

export const deviceRouter = Router({});

deviceRouter
    .get('/devices',
        idValidation,
        inputValidationResultMiddleware,
        getDeviceListHandler
    )

    .delete('/devices/:id',
        deviceIdValidation,
        accessTokenGuard,
        inputValidationResultMiddleware,
        // todo
    )

    .delete('/devices',
        accessTokenGuard,
        commentInputValidation,
        inputValidationResultMiddleware,
        // todo
    )

