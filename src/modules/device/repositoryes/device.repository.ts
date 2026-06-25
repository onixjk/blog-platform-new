import { sessionCollection } from "../../../db/mongo.db";
import { Session } from "../../../auth/types/session";
import { WithId } from "mongodb";

export const deviceRepository = {

    async findSessionById(deviceId: string): Promise<WithId<Session> | null> {
        return await sessionCollection.findOne({ device_id: deviceId });
    },

    async deleteSessionById(deviceId: string): Promise<boolean> {
        const result = await sessionCollection.deleteOne({ device_id: deviceId });

        return result.deletedCount > 0;
    },

    async deleteOtherSessions(userId: string, deviceId: string): Promise<boolean> {
        const result = await sessionCollection.deleteMany({
            user_id: userId,
            device_id: { $ne: deviceId }
        });

        return result.acknowledged;
    },
}