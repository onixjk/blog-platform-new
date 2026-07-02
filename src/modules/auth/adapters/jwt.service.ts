import jwt from "jsonwebtoken";
import { appConfig } from "../../../core/config/config";
import { RefreshTokenPayload } from "../types/refresh-token-payload.interface";

export class JwtService {
    async createAccessToken(userId: string): Promise<string | null> {
        return new Promise((resolve) => {
            jwt.sign(
                {userId},
                appConfig.AC_SECRET,
                {expiresIn: appConfig.AC_TIME as any},
                (err, token) => {
                    if (err || !token) {
                        return resolve(null);
                    }
                    resolve(token);
                }
            );
        });
    }

    async createRefreshToken(userId: string, deviceId: string): Promise<string | null> {
        return new Promise((resolve) => {
            jwt.sign(
                {userId, deviceId},
                appConfig.RT_SECRET,
                {expiresIn: appConfig.RT_TIME as any},
                (err, token) => {
                    if (err || !token) {
                        return resolve(null);
                    }
                    resolve(token);
                }
            );
        });
    }

    async decodeToken(token: string): Promise<any> {
        try {
            return jwt.decode(token);
        } catch (e: unknown) {
            console.error("Can't decode token", e);
            return null;
        }
    }

    async verifyAccessToken(token: string): Promise<{ userId: string } | null> {
        try {
            return jwt.verify(token, appConfig.AC_SECRET) as { userId: string };
        } catch (error) {
            console.error("Token verify some error");
            return null;
        }
    }

    async verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
        try {
            const decoded = jwt.verify(token, appConfig.RT_SECRET);

            if (typeof decoded === 'string')
                return null;

            return decoded as RefreshTokenPayload;
        } catch (error) {
            console.error("Token verify some error");
            return null;
        }
    }
}