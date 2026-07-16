import { ResultStatus } from "./resultCode";
import { HttpStatuses } from "../types/http-statuses";

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
    switch (resultCode) {
        case ResultStatus.Success:
            return HttpStatuses.Ok_200;

        case ResultStatus.BadRequest_400:
            return HttpStatuses.BadRequest_400;
        case ResultStatus.Unauthorized_401:
            return HttpStatuses.Unauthorized_401;
        case ResultStatus.Forbidden_403:
            return HttpStatuses.Forbidden_403;
        case ResultStatus.NotFound_404:
            return HttpStatuses.NotFound_404;
        case ResultStatus.Conflict_409:
            return HttpStatuses.Conflict_409;
        case ResultStatus.TooManyRequests_429:
            return HttpStatuses.TooManyRequests_429;

        case ResultStatus.InternalServerError_500:
            return HttpStatuses.InternalServerError_500;
        default:
            return HttpStatuses.InternalServerError_500;
    }
};