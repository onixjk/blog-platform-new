import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {authService} from "../../application/authService";
import {ResultStatus} from "../../../core/result/resultCode";

export async function logoutHandler(
    req: Request,
    res: Response,
) {
    const refreshToken = req.cookies.refreshToken;

    const result = await authService.logout(refreshToken);

    if (result.status !== ResultStatus.NoContent) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    res.clearCookie('refreshToken');
    res.sendStatus(HttpStatuses.NoContent_204);
}