import { NextFunction, Request, Response } from 'express';
import { JwtService } from "../adapters/jwt.service";
import { container } from "../../../composition-root";

const jwtService = container.get(JwtService);

export const guestOrUserAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    // req.user = { id: null };
    //
    // if (!req.headers.authorization) return next();

    if (!req.user) {
        req.user = { id: null };
    }

    if (!req.headers.authorization) {
        req.user.id = null;

        next();
        return;
    }

    const [authType, token] = req.headers.authorization.split(' ');

    if (authType !== 'Bearer' || !token) {
        next();
        return;
    }

    const payload = await jwtService.verifyAccessToken(token);

    if (!payload) {
        next();
        return;
    }

    req.user = { id: payload.userId };

    next();
    return;
};
