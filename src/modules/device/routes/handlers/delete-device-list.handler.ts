import { Request, Response } from 'express';
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { DeviceService } from "../../application/device.service";

export const deleteDeviceListHandler = (
    deviceService: DeviceService
) => async (
    req: Request,
    res: Response
) => {
    const userId = req.user?.id;
    const currentDeviceId = req.deviceId;

    if (!userId || !currentDeviceId) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    const result = await deviceService.deleteOtherSessions(userId, currentDeviceId);

    if (result.status !== ResultStatus.NoContent_204) {
        return res
            .status(resultCodeToHttpException(result.status))
            .send({ errorsMessages: result.extensions });
    }

    return res.sendStatus(HttpStatuses.NoContent_204);
}