import {tokensCollection} from "../../db/mongo.db";
import {RefreshToken} from "../types/refresh-token";

export const authRepository = {

    async saveRefreshToken(dto: RefreshToken): Promise<void> {
        await tokensCollection.insertOne(dto);
    },
}