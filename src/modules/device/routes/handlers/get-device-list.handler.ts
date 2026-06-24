import {Request, Response} from 'express';
import {HttpStatuses} from "../../../../core/types/http-statuses";
import {deviceQueryRepository} from "../../repositoryes/device.query.repository";

export async function getDeviceListHandler(
    req: Request,
    res: Response
) {
    const userId = req.user?.id;
    if (!userId) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    const devices = await deviceQueryRepository.findMany(userId);

    return res.status(HttpStatuses.Ok_200).send(devices);
}