import { Device } from "../types/device.";
import { sessionCollection } from "../../../db/mongo.db";

export const deviceQueryRepository = {

    async findMany(userId: string): Promise<Device[]> {

        // const sessions = await sessionCollection
        //     .find({user_id: userId})
        //     .toArray();
        //
        // return sessions.map((session) => ({
        //     ip: session.ip,
        //     title: session.browserName,
        //     lastActiveDate: session.iat.toISOString(),
        //     deviceId: session.device_id
        // }));

        const sessions = await sessionCollection
            .find({ user_id: userId })
            .toArray();

        return sessions.map((session) => {
            // 1. Получаем стандартную ISO-строку (например, "2026-06-25T15:30:00.000Z")
            const isoString = session.iat.toISOString();

            // 2. С помощью регулярного выражения вырезаем миллисекунды (.000),
            // чтобы получить строго "2026-06-25T15:30:00Z"
            const lastActiveDateWithoutMs = isoString.replace(/\.\d{3}/, '');

            return {
                ip: session.ip,
                title: session.browserName,
                lastActiveDate: lastActiveDateWithoutMs, // Передаем очищенную дату!
                deviceId: session.device_id
            };
        });
    }
}