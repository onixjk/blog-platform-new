import { Router } from "express";
import { deviceIdValidation } from "../../../core/middlewares/validation/params-id.validation-middleware";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { getDeviceListHandler } from "./handlers/get-device-list.handler";
import { deleteDeviceHandler } from "./handlers/delete-device.handler";
import { refreshTokenGuard } from "../../auth/middlewares/refreshTokenGuard";
import { deleteDeviceListHandler } from "./handlers/delete-device-list.handler";
import { container } from "../../../composition-root";
import { DeviceQueryRepository } from "../repositoryes/device.query.repository";
import { DeviceService } from "../application/device.service";

export const deviceRouter = Router({});

const deviceQueryRepository = container.get(DeviceQueryRepository)
const deviceService = container.get(DeviceService)

deviceRouter
    .get('/devices',
        refreshTokenGuard,
        getDeviceListHandler(deviceQueryRepository)
    )

    .delete('/devices/:deviceId',
        refreshTokenGuard,
        deviceIdValidation,
        inputValidationResultMiddleware,
        deleteDeviceHandler(deviceService)
    )

    .delete('/devices',
        refreshTokenGuard,
        inputValidationResultMiddleware,
        deleteDeviceListHandler(deviceService)
    )