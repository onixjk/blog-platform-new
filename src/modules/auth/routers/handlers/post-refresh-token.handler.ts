import {Request, Response} from "express";
import {ResultStatus} from "../../../../core/result/resultCode";
import {resultCodeToHttpException} from "../../../../core/result/resultCodeToHttpException";
import {HttpStatuses} from "../../../../core/types/http-statuses";
import { authService } from "../../../../composition-root";

export async function refreshTokenHandler(
    req: Request,
    res: Response,
) {
    const cookie_name = 'refreshToken'
    const userId = req.user.id;
    const deviceId = req.deviceId;
    if (!userId || !deviceId) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    const result = await authService.refreshSession(userId, deviceId);

    if (result.status !== ResultStatus.Success_200 || !result.data) {
        return res
            .status(resultCodeToHttpException(result.status))
            .send({errorsMessages: result.extensions});
    }

    res.cookie(cookie_name, result.data.refreshToken, {httpOnly: true, secure: true})
    return res.status(HttpStatuses.Ok_200).send({accessToken: result.data.accessToken});
}