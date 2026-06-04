import {tokensCollection} from "../../db/mongo.db";

export const authRepository = {

    async saveRefreshToken(refreshToken: string): Promise<void> {
        await tokensCollection.insertOne(refreshToken);
    },

}