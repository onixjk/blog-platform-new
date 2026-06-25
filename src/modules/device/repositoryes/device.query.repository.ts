import { Device } from "../types/device.";
import { sessionCollection } from "../../../db/mongo.db";

export const deviceQueryRepository = {

    async findMany(userId: string): Promise<Device[]> {

        const sessions = await sessionCollection
            .find({user_id: userId})
            .toArray();

        return sessions.map((session) => ({
            ip: session.ip,
            title: session.browserName,
            lastActiveDate: session.iat.toISOString(),
            deviceId: session.device_id
        }));
    }
}