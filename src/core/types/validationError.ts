import { HttpStatuses } from './http-statuses';

export type ValidationErrorType = {
    status: HttpStatuses;
    detail: string;
    source?: string;
    code?: string;
};