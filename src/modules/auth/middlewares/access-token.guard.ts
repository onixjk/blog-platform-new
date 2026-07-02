import {NextFunction, Request, Response} from 'express';
import {HttpStatuses} from "../../../core/types/http-statuses";
import { jwtService } from "../../../composition-root";

export const accessTokenGuard = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.headers.authorization)
        return res.sendStatus(HttpStatuses.Unauthorized_401);

    const [authType, token] = req.headers.authorization.split(' ');

    if (authType !== 'Bearer')
        return res.sendStatus(HttpStatuses.Unauthorized_401);

    const payload = await jwtService.verifyAccessToken(token);

    if (!payload) {
        res.sendStatus(HttpStatuses.Unauthorized_401);
        return;
    }

    const {userId} = payload;

    req.user = {id: userId};

    next();
    return;
};