import { Result } from "../../../core/result/result.type";
import { DeviceRepository } from "../repositoryes/device.repository";
import { ResultStatus } from "../../../core/result/resultCode";
import { inject, injectable } from "inversify";

@injectable()
export class DeviceService {

    constructor(@inject(DeviceRepository) private deviceRepository: DeviceRepository) {
    }

    async deleteSessionById(userId: string, deviceId: string): Promise<Result<boolean | null>> {
        const session = await this.deviceRepository.findSessionById(deviceId);
        if (!session) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'Not found',
                data: null,
                extensions: [{ field: 'Session', message: 'Session not found' }]
            };
        }

        if (session.user_id !== userId) {
            return {
                status: ResultStatus.Forbidden_403,
                errorMessage: 'Forbidden',
                data: null,
                extensions: [{ field: 'Session', message: 'You do not have permission to delete this session' }]
            };
        }

        const isDeleted = await this.deviceRepository.deleteSessionById(deviceId);

        return {
            status: ResultStatus.Success,
            data: isDeleted,
            extensions: []
        };
    }

    async deleteOtherSessions(userId: string, deviceId: string): Promise<Result<boolean | null>> {

        const isAllDeleted = await this.deviceRepository.deleteOtherSessions(userId, deviceId);

        return {
            status: ResultStatus.Success,
            data: isAllDeleted,
            extensions: []
        };
    }
}