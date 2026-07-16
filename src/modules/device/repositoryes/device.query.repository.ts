import { Device } from "../types/device.";
import { injectable } from "inversify";
import { SessionModel } from "../../../db/mongo.db";

@injectable()
export class DeviceQueryRepository {

    async findMany(userId: string): Promise<Device[]> {

        const sessions = await SessionModel.find({ user_id: userId }).lean();

        return sessions.map((session) => ({
            ip: session.ip,
            title: session.browserName,
            lastActiveDate: session.iat.toISOString(),
            deviceId: session.device_id
        }));
    }
}