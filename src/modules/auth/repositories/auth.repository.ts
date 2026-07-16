import { Session } from "../types/session";
import { injectable } from "inversify";
import { SessionModel } from "../../../db/mongo.db";
import { HydratedDocument } from "mongoose";

@injectable()
export class AuthRepository {

    async findSession(deviceId: string): Promise<HydratedDocument<Session> | null> {
        return await SessionModel.findOne({ device_id: deviceId });
    }

    async save(document: HydratedDocument<Session>): Promise<string> {
        const savedSession = await document.save();

        return savedSession.id;
    }

    async updateIat(deviceId: string, iat: Date): Promise<boolean> {
        const result = await SessionModel.updateOne({ device_id: deviceId }, { iat: iat });

        return result.matchedCount > 0;
    }

    async delete(deviceId: string): Promise<boolean> {
        const result = await SessionModel.deleteOne({ device_id: deviceId });

        return result.deletedCount > 0;
    }
}