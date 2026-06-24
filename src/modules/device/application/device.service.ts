import { Result } from "../../../core/result/result.type";
import { deviceRepository } from "../repositoryes/device.repository";
import { ResultStatus } from "../../../core/result/resultCode";

export const deviceService = {

    async deleteSessionById(deviceId: string): Promise<Result> {
        const result = await deviceRepository.deleteSessionById(deviceId);

        if (!result) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Unauthorized",
                extensions: [{ field: "", message: "" }]
            };
        }

        return {
            status: ResultStatus.NoContent,
            data: null,
            extensions: []
        };
    }
}