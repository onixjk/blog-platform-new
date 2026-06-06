import jwt from "jsonwebtoken";
import {appConfig} from "../../core/config/config";

export const jwtService = {
    async createAccessToken(userId: string): Promise<string> {
        return jwt.sign({userId}, appConfig.AC_SECRET, {
            expiresIn: '1h',
            // appConfig.AC_TIME as any,

        });
    },

    async createRefreshToken(userId: string): Promise<string> {
        return jwt.sign({userId}, appConfig.RT_SECRET, {
            expiresIn: '20d'
                // appConfig.RT_TIME as any,
        });
    },

    async decodeToken(token: string): Promise<any> {
        try {
            return jwt.decode(token);
        } catch (e: unknown) {
            console.error("Can't decode token", e);
            return null;
        }
    },

    async verifyAccessToken(token: string): Promise<{ userId: string } | null> {
        try {
            return jwt.verify(token, appConfig.AC_SECRET) as { userId: string };
        } catch (error) {
            console.error("Token verify some error");
            return null;
        }
    },

    async verifyRefreshToken(token: string): Promise< { userId: string } | null> {
        try {
            return jwt.verify(token, appConfig.RT_SECRET) as { userId: string};
        } catch (error) {
            console.error("Token verify some error");
            return null;
        }
    }
}