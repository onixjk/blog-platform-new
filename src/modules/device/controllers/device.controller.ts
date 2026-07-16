import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { HttpStatuses } from "../../../core/types/http-statuses";
import { ResultStatus } from "../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../core/result/resultCodeToHttpException";
import { DeviceService } from "../application/device.service";
import { DeviceQueryRepository } from "../repositoryes/device.query.repository";

@injectable()
export class DeviceController {

    constructor(
        @inject(DeviceService) private deviceService: DeviceService,
        @inject(DeviceQueryRepository) private deviceQueryRepository: DeviceQueryRepository,
    ) {}

    async getDeviceList(req: Request, res: Response) {
        const userId = req.user.id;
        if (!userId) return res.sendStatus(HttpStatuses.Unauthorized_401);

        const devices = await this.deviceQueryRepository.findMany(userId);

        return res.status(HttpStatuses.Ok_200).send(devices);
    }

    async deleteDevice(req: Request<{ deviceId: string }, {}, {}, {}>, res: Response) {
        const userId = req.user.id;
        const deviceId = req.params.deviceId;
        if (!userId || !deviceId) return res.sendStatus(HttpStatuses.Unauthorized_401);

        const result = await this.deviceService.deleteSessionById(userId, deviceId);
        if (result.status !== ResultStatus.Success) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });
        }

        return res.sendStatus(HttpStatuses.NoContent_204);
    }

    async deleteDeviceList(req: Request, res: Response) {
        const userId = req.user.id;
        const currentDeviceId = req.deviceId;
        if (!userId || !currentDeviceId) return res.sendStatus(HttpStatuses.Unauthorized_401);

        const result = await this.deviceService.deleteOtherSessions(userId, currentDeviceId);
        if (!result) return res.sendStatus(HttpStatuses.BadRequest_400);

        return res.sendStatus(HttpStatuses.NoContent_204);
    }
}