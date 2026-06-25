import { Router } from "express";
import { deviceIdValidation, idValidation } from "../../../core/middlewares/validation/params-id.validation-middleware";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { getDeviceListHandler } from "./handlers/get-device-list.handler";
import { deleteDeviceHandler } from "./handlers/delete-device.handler";
import { refreshTokenGuard } from "../../../auth/middlewares/refreshTokenGuard";
import { deleteDeviceListHandler } from "./handlers/delete-device-list.handler";

export const deviceRouter = Router({});

deviceRouter
    .get('/devices',
        deviceIdValidation,
        inputValidationResultMiddleware,
        getDeviceListHandler
    )

    .delete('/devices/:id',
        deviceIdValidation,
        refreshTokenGuard,
        inputValidationResultMiddleware,
        deleteDeviceHandler
    )

    .delete('/devices',
        refreshTokenGuard,
        inputValidationResultMiddleware,
        deleteDeviceListHandler
    )