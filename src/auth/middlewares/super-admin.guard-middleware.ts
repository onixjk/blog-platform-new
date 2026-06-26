import {NextFunction, Request, Response} from 'express';
import {HttpStatuses} from '../../core/types/http-statuses';

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qwerty';

// export const superAdminGuardMiddleware = (
//     req: Request,
//     res: Response,
//     next: NextFunction,
// ) => {
//
//     const auth = req.headers['authorization'] as string; // 'Basic xxxx'
//
//     if (!auth) {
//         res.sendStatus(HttpStatuses.Unauthorized_401);
//         return;
//     }
//
//     const [authType, token] = auth.split(' ');
//
//     if (authType !== 'Basic') {
//         res.sendStatus(HttpStatuses.Unauthorized_401);
//         return;
//     }
//
//     const credentials = Buffer.from(token, 'base64').toString('utf-8'); //dbcadkcnasdk
//
//     const [username, password] = credentials.split(':'); //admin:qwerty
//
//     if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
//         res.sendStatus(HttpStatuses.Unauthorized_401);
//         return;
//     }
//
//     next();
// };

export const superAdminGuardMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const auth = req.headers['authorization'];

    if (!auth) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    const parts = auth.split(' ');

    // Защита: проверяем, что в заголовке ровно два элемента (тип и сам токен)
    if (parts.length !== 2 || parts[0] !== 'Basic') {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    const token = parts[1];

    try {
        const credentials = Buffer.from(token, 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');

        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return res.sendStatus(HttpStatuses.Unauthorized_401);
        }

        return next();
    } catch (error) {
        // На случай, если Buffer.from споткнется о невалидный base64
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }
};
