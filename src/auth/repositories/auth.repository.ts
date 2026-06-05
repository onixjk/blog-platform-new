import {tokensCollection} from "../../db/mongo.db";
import {RefreshToken} from "../types/refresh-token";
import {WithId} from "mongodb";

export const authRepository = {

    async saveRefreshToken(dto: RefreshToken): Promise<void> {
        await tokensCollection.insertOne(dto);
    },

    async findRefreshToken(refreshToken: string): Promise<WithId<RefreshToken> | null> {
        return await tokensCollection.findOne({ data: refreshToken })
    }
}