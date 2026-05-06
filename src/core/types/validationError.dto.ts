import {HttpStatus} from "./http-statuses";

export type ValidationErrorOutput = {
    status: HttpStatus;
    detail: string;
    source: { pointer: string };
    code: string | null;
};

export type ValidationErrorListOutput = { errors: ValidationErrorOutput[] };