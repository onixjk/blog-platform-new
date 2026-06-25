import {sessionCollection} from "../../db/mongo.db";
import {WithId} from "mongodb";
import {Session} from "../types/session";

export const authRepository = {

    async saveSession(session: Session): Promise<void> {
        await sessionCollection.insertOne(session);
    },

    async findSession(deviceId: string): Promise<WithId<Session> | null> {
        return await sessionCollection.findOne({device_id: deviceId});
    },

    async updateIat(deviceId: string, iat: Date): Promise<boolean> {
        const result = await sessionCollection.updateOne(
            { device_id: deviceId },
            { $set: { iat: iat } }
        );

        return result.matchedCount > 0;
    },

    async deleteSession(deviceId: string): Promise<boolean> {
        const result = await sessionCollection.deleteOne({ device_id: deviceId });
        return result.deletedCount > 0;
    },

    async findAllUserSessions(userId: string): Promise<WithId<Session>[]> {
        return await sessionCollection.find({ user_id: userId }).toArray();
    },
}