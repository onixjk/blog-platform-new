import {sessionCollection} from "../../db/mongo.db";
import {WithId} from "mongodb";
import {Session} from "../types/session";
import {FindSessionDto} from "../types/findSession.dto";

export const authRepository = {

    async saveSession(session: Session): Promise<void> {
        await sessionCollection.insertOne(session);
    },

    async findRefreshToken(dto: FindSessionDto): Promise<WithId<Session> | null> {
        return await sessionCollection.findOne({device_id: dto.deviceId, iat: dto.iat});
    },

    async updateIat(deviceId: string, iat: string): Promise<boolean> {
        const result = await sessionCollection.updateOne( // updateOne
            { device_id: deviceId },
            { $set: { iat: iat } }
        );

        return result.matchedCount > 0;
    },
}