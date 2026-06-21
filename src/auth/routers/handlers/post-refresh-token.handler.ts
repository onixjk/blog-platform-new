import {Request, Response} from "express";
import {authService} from "../../application/authService";
import {ResultStatus} from "../../../core/result/resultCode";
import {resultCodeToHttpException} from "../../../core/result/resultCodeToHttpException";
import {HttpStatuses} from "../../../core/types/http-statuses";

export async function refreshTokenHandler(
    req: Request,
    res: Response,
) {
    const cookie_name = 'refreshToken'
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
        return res
            .status(resultCodeToHttpException(ResultStatus.Unauthorized))
            .send({errorsMessages: [{field: 'refreshToken', message: 'Refresh token is missing'}]});


    const result = await authService.refreshSession(refreshToken);

    if (result.status !== ResultStatus.Success) {
        return res
            .status(resultCodeToHttpException(result.status))
            .send({errorsMessages: result.extensions});
    }

    res.cookie(cookie_name, result.data!.refreshToken, {httpOnly: true, secure: true})
    res.status(HttpStatuses.Ok_200).send({accessToken: result.data!.accessToken});
}