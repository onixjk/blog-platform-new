import {NextFunction, Request, Response} from 'express';
import {jwtService} from "../adapters/jwt.service";
import {HttpStatuses} from "../../core/types/http-statuses";

export const accessTokenGuard = async (req: Request, res: Response, next: NextFunction) => {

    if (!req.headers.authorization)
        return res.sendStatus(HttpStatuses.Unauthorized_401);

    const [authType, token] = req.headers.authorization.split(' ');

    if (authType !== 'Bearer')
        return res.sendStatus(HttpStatuses.Unauthorized_401);

    const payload = await jwtService.verifyToken(token);

    if (payload) {
        const {userId} = payload;

        req.user = {id: userId} as {id:string};
        next();

        return;
    }

    res.sendStatus(HttpStatuses.Unauthorized_401);

    return;
};