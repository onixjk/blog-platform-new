import { NextFunction, Request, Response } from 'express';
import { jwtService } from "../adapters/jwt.service";
import { HttpStatuses } from "../../core/types/http-statuses";
import { authService } from "../application/authService";
import { ResultStatus } from "../../core/result/resultCode";
import jwt from "jsonwebtoken";
import { authRepository } from "../repositories/auth.repository";

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

    if (sessionRecord.data.iat !== payload.iat.toString()) {
        await authRepository.deleteSession(payload.deviceId);
        return res.sendStatus(HttpStatuses.Unauthorized_401);
    }

    req.user = { id: payload.userId };
    req.deviceId = payload.deviceId;

    next();
    return;
};