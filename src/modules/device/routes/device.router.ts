import { Router } from "express";
import { deviceIdValidation } from "../../../core/middlewares/validation/params-id.validation-middleware";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { container } from "../../../composition-root";
import { DeviceController } from "../controllers/device.controller";
import { refreshTokenGuard } from "../../auth/middlewares/refresh-token.guard";

export const deviceRouter = Router({});

const deviceController = container.get(DeviceController)

deviceRouter
    .get('/devices',
        refreshTokenGuard,
        deviceController.getDeviceList.bind(deviceController)
    )

    .delete('/devices/:deviceId',
        refreshTokenGuard,
        deviceIdValidation,
        inputValidationResultMiddleware,
        deviceController.deleteDevice.bind(deviceController)
    )

    .delete('/devices',
        refreshTokenGuard,
        inputValidationResultMiddleware,
        deviceController.deleteDeviceList.bind(deviceController)
    )