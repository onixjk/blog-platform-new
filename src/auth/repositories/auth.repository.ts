import {sessionCollection} from "../../db/mongo.db";
import {WithId} from "mongodb";
import {Session} from "../types/session";

export const authRepository = {

    async saveSession(session: Session): Promise<void> {
        await sessionCollection.insertOne(session);
    },

    // async findRefreshToken(refreshToken: string): Promise<WithId<RefreshToken> | null> {
    //     return await sessionCollection.findOne({refreshToken: refreshToken, isValid: true});
    // },

    async setTokenValidToFalse(refreshToken: string): Promise<boolean> {
        const result = await sessionCollection.updateMany( // updateOne
            { refreshToken: refreshToken },
            { $set: { isValid: false } }
        );

        return result.matchedCount > 0;
    },
}