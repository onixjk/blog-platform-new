import {Request, Response} from "express";
import {HttpStatuses} from "../../../../core/types/http-statuses";
import {ResultStatus} from "../../../../core/result/resultCode";
import { authService } from "../../../../composition-root";

export async function logoutHandler(
    req: Request,
    res: Response,
) {
    const deviceId = req.deviceId;
    if (!deviceId) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    const result = await authService.deleteSession(deviceId);

    if (result.status !== ResultStatus.NoContent) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    res.clearCookie('refreshToken', { httpOnly: true, secure: true });
    res.sendStatus(HttpStatuses.NoContent_204);
}