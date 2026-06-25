import { Result } from "../../../core/result/result.type";
import { deviceRepository } from "../repositoryes/device.repository";
import { ResultStatus } from "../../../core/result/resultCode";

export const deviceService = {

    async deleteSessionById(userId: string, deviceId: string): Promise<Result> {
        const session = await deviceRepository.findSessionById(deviceId);
        if (!session) {
            return {
                status: ResultStatus.NotFound,
                errorMessage: 'Not found',
                data: null,
                extensions: [{ field: 'Session', message: 'Session not found' }]
            };
        }

        if (session.user_id !== userId) {
            return {
                status: ResultStatus.Forbidden,
                errorMessage: 'Forbidden',
                data: null,
                extensions: [{ field: 'Session', message: 'You do not have permission to delete this session' }]
            };
        }

        const isDeleted = await deviceRepository.deleteSessionById(deviceId);
        if (!isDeleted) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'Not Found',
                extensions: [{ field: 'Session', message: 'Session could not be deleted' }]
            };
        }

        return {
            status: ResultStatus.NoContent,
            data: null,
            extensions: []
        };
    },

    async deleteOtherSessions(userId: string, deviceId: string): Promise<Result> {
        const isCompleted = await deviceRepository.deleteOtherSessions(userId, deviceId);

        if (!isCompleted) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'Session', message: 'Could not complete operation' }]
            };
        }

        return {
            status: ResultStatus.NoContent,
            data: null,
            extensions: []
        };
    },
}