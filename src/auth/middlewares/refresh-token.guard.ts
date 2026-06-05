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


    const [payload, result] = await Promise.all([
        jwtService.verifyRefreshToken(token),
        authService.findRefreshToken(token)
    ]);

    if (!payload || !result) {
        res.sendStatus(HttpStatuses.Unauthorized_401);
        return;
    }

    const {userId} = payload;
    const {expireDate, isValid} = result.data!;

    if (!isValid || Date.now() > expireDate.getTime()) {
        res.sendStatus(HttpStatuses.Unauthorized_401);
        return;
    }

    // req.user = {id: userId} as { id: string };
    req.user = {id: userId};

    next();
    return;
};