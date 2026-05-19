import jwt from "jsonwebtoken";
import {appConfig} from "../../core/config/config";

export const jwtService = {
    async createToken(userId: string): Promise<string> {

        console.log("DEBUG JWT:", {
            userId,
            secret: appConfig.AC_SECRET,
            time: appConfig.AC_TIME
        });

        try {
            return jwt.sign({userId}, appConfig.AC_SECRET, {
                expiresIn: appConfig.AC_TIME as any,
            });
        } catch (error) {
            console.error("КРИТИЧЕСКАЯ ОШИБКА В jwt.sign:", error);
            throw error;
        }
    },

    async decodeToken(token: string): Promise<any> {
        try {
            return jwt.decode(token);
        } catch (e: unknown) {
            console.error("Can't decode token", e);
            return null;
        }
    },

    async verifyToken(token: string): Promise<{ userId: string } | null> {
        try {
            return jwt.verify(token, appConfig.AC_SECRET) as { userId: string };
        } catch (error) {
            console.error("Token verify some error");
            return null;
        }
    }
}