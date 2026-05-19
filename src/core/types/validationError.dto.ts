import {HttpStatuses} from "./http-statuses";

export type ValidationErrorOutput = {
    status: HttpStatuses;
    detail: string;
    source: { pointer: string };
    code: string | null;
};

export type ValidationErrorListOutput = { errors: ValidationErrorOutput[] };