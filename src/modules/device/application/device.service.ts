import { Result } from "../../../core/result/result.type";
import { DeviceRepository } from "../repositoryes/device.repository";
import { ResultStatus } from "../../../core/result/resultCode";
import { inject, injectable } from "inversify";

@injectable()
export class DeviceService {

    constructor(@inject(DeviceRepository) private deviceRepository: DeviceRepository) {
    }

    async deleteSessionById(userId: string, deviceId: string): Promise<Result> {
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
        if (!isDeleted) {
            return {
                status: ResultStatus.NotFound_404,
                data: null,
                errorMessage: 'Not Found',
                extensions: [{ field: 'Session', message: 'Session could not be deleted' }]
            };
        }

        return {
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: []
        };
    }

    async deleteOtherSessions(userId: string, deviceId: string): Promise<Result> {
        const isCompleted = await this.deviceRepository.deleteOtherSessions(userId, deviceId);

        if (!isCompleted) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'Session', message: 'Could not complete operation' }]
            };
        }

        return {
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: []
        };
    }
}