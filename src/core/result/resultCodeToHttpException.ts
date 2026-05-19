import { ResultStatus } from "./resultCode";
import {HttpStatuses} from "../types/http-statuses";

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
    switch (resultCode) {
        case ResultStatus.BadRequest:
            return HttpStatuses.BadRequest_400;
        case ResultStatus.Forbidden:
            return HttpStatuses.Forbidden_403;
        default:
            return HttpStatuses.InternalServerError_500;
    }
};