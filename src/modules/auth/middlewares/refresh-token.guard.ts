import { NextFunction, Request, Response } from 'express';
import { HttpStatuses } from "../../../core/types/http-statuses";
import { container } from "../../../composition-root";
import { JwtService } from "../adapters/jwt.service";
import { AuthService } from "../application/auth.service";

const jwtService = container.get(JwtService);
const authService = container.get(AuthService);

export const refreshTokenGuard = async (req: Request, res: Response, next: NextFunction) => {

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    const payload = await jwtService.verifyRefreshToken(refreshToken);
    if (!payload || typeof payload.iat === 'undefined') {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    const sessionRecord = await authService.findSession(payload.deviceId);
    if (!sessionRecord.data) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    const sessionIatInSeconds = Math.floor(sessionRecord.data.iat.getTime() / 1000);
    const payloadIat = Math.floor(payload.iat);

    if (sessionIatInSeconds !== payloadIat) {
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    req.user = { id: payload.userId };
    req.deviceId = payload.deviceId;

    next();
    return;
};