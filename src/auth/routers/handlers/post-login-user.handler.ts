import { Request, Response } from "express";
import { LoginInputDto } from "../../input/login.input-dto";
import { authService } from "../../application/authService";
import { HttpStatuses } from "../../../core/types/http-statuses";
import { ResultStatus } from "../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../core/result/resultCodeToHttpException";

export async function loginUserHandler(
    req: Request<{}, {}, LoginInputDto>,
    res: Response,
) {
    const { loginOrEmail, password } = req.body;
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp = (Array.isArray(forwardedFor) ?
            forwardedFor[0] : forwardedFor?.split(',')[0].trim() ||
            req.socket.remoteAddress) ||
        'unknown clientIp';

    const browserName = req.useragent?.browser || 'Unknown Browser';
    const cookie_name = 'refreshToken';

    const result = await authService.loginUser(loginOrEmail, password, browserName, clientIp);

    if (result.status !== ResultStatus.Success) {
        res.clearCookie(cookie_name);
        return res.status(resultCodeToHttpException(result.status)).send(result.extensions);
    }

    res.cookie(cookie_name, result.data!.refreshToken, { httpOnly: true, secure: true })
    return res.status(HttpStatuses.Ok_200).send({ accessToken: result.data!.accessToken });
}