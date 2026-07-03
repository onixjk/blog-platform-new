import {ResultStatus} from "./resultCode";
import {HttpStatuses} from "../types/http-statuses";

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
    switch (resultCode) {
        case ResultStatus.Success_200:
            return HttpStatuses.Ok_200;
        case ResultStatus.Created_201:
            return HttpStatuses.Created_201;
        case ResultStatus.NoContent_204:
            return HttpStatuses.NoContent_204;
        case ResultStatus.BadRequest_400:
            return HttpStatuses.BadRequest_400;
        case ResultStatus.Unauthorized_401:
            return HttpStatuses.Unauthorized_401;
        case ResultStatus.Forbidden_403:
            return HttpStatuses.Forbidden_403;
        case ResultStatus.NotFound_404:
            return HttpStatuses.NotFound_404;
        default:
            return HttpStatuses.InternalServerError_500;
    }
};