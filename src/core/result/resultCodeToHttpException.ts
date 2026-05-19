import {ResultStatus} from "./resultCode";
import {HttpStatuses} from "../types/http-statuses";

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
    switch (resultCode) {
        case ResultStatus.Success:
            return HttpStatuses.Ok_200
        case ResultStatus.BadRequest:
            return HttpStatuses.BadRequest_400;
        case ResultStatus.Unauthorized:
            return HttpStatuses.Unauthorized_401
        case ResultStatus.Forbidden:
            return HttpStatuses.Forbidden_403;
        case ResultStatus.NotFound:
            return HttpStatuses.NotFound_404
        default:
            return HttpStatuses.InternalServerError_500;
    }
};