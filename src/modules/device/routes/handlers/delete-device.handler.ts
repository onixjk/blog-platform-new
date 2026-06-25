import { Request, Response } from 'express';
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { deviceService } from "../../application/device.service";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";

export async function deleteDeviceHandler(
    req: Request<{ id: string }, {}, {}, {}>,
    res: Response
) {
    const userId = req.user?.id;
    const deviceId = req.params.id;

    if (!userId || !deviceId) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    const result = await deviceService.deleteSessionById(userId, deviceId);

    if (result.status !== ResultStatus.NoContent) {
        return res
            .status(resultCodeToHttpException(result.status))
            .send({ errorsMessages: result.extensions });
    }


    return res.sendStatus(HttpStatuses.NoContent_204);
}