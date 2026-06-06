import {NextFunction, Request, Response} from 'express';
import {jwtService} from "../adapters/jwt.service";
import {HttpStatuses} from "../../core/types/http-statuses";
import {authService} from "../application/authService";
import {ResultStatus} from "../../core/result/resultCode";

export const refreshTokenGuard = async (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies?.refreshToken;

    if (!token) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    const [payload, result] = await Promise.all([
        jwtService.verifyRefreshToken(token),
        authService.findRefreshToken(token)
    ]);

    if (!payload || !result.data || result.status !== ResultStatus.Success) {
        res.sendStatus(HttpStatuses.Unauthorized_401);
        return;
    }

    const {userId} = payload;
    const {expireDate, isValid} = result.data;

    if (!isValid || Date.now() > expireDate.getTime()) {
        res.sendStatus(HttpStatuses.Unauthorized_401);
        return;
    }

    // req.user = {id: userId} as { id: string };
    req.user = {id: userId};

    next();
    return;
};