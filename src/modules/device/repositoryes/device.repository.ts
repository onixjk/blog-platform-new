import { SessionModel } from "../../../db/mongo.db";
import { Session } from "../../auth/types/session";
import { injectable } from "inversify";
import { HydratedDocument } from "mongoose";

@injectable()
export class DeviceRepository {

    async findSessionById(deviceId: string): Promise<HydratedDocument<Session> | null> {
        return await SessionModel.findOne({ device_id: deviceId });
    }

    async deleteSessionById(deviceId: string): Promise<boolean> {
        const result = await SessionModel.deleteOne({ device_id: deviceId });

        return result.deletedCount > 0;
    }

    async deleteOtherSessions(userId: string, deviceId: string): Promise<boolean> {
        const result = await SessionModel.deleteMany({
            user_id: userId,
            device_id: { $ne: deviceId }
        });

        return result.acknowledged;
    }
}