import {NextFunction, Request, Response} from 'express';
import {jwtService} from "../adapters/jwt.service";
import {HttpStatuses} from "../../core/types/http-statuses";
import {authService} from "../application/authService";

export const refreshTokenGuard = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.headers.authorization)
        return res.sendStatus(HttpStatuses.Unauthorized_401);

    const [authType, token] = req.headers.authorization.split(' ');

    if (authType !== 'Bearer')
        return res.sendStatus(HttpStatuses.Unauthorized_401);

    const payload = await jwtService.verifyRefreshToken(token);
    const result = await authService.findRefreshToken(token);

    if (!payload || !result) {
        res.sendStatus(HttpStatuses.Unauthorized_401);
        return;
    }

    const {exp} = payload;
    const {refreshToken, expireDate, isValid} = result.data!;

    if (
        refreshToken !== token ||
        exp * 1000 > expireDate.getTime() ||
        !isValid
    ) {
        res.sendStatus(HttpStatuses.Unauthorized_401);
        return;
    }

    next();
    return;
};