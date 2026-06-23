import jwt from "jsonwebtoken";

export interface RefreshTokenPayload extends jwt.JwtPayload {
    userId: string;
    deviceId: string;
}