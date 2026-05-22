import { Response } from 'express';
import { RepositoryNotFoundError } from './repository-not-found.error';
import { HttpStatuses } from '../types/http-statuses';
import { DomainError } from './domain.error';
import {createErrorMessages} from "../middlewares/validation/input-validation-result.middleware";
import {ForbiddenError} from "./repository-forbidden.error";

export function errorsHandler(error: unknown, res: Response): void {

    if (error instanceof RepositoryNotFoundError) {
        const httpStatus = HttpStatuses.NotFound_404;

        res.status(httpStatus).send(
            createErrorMessages([
                {
                    status: httpStatus,
                    detail: error.message,
                },
            ]),
        );

        return;
    }

    if (error instanceof ForbiddenError) {
        const httpStatus = HttpStatuses.Forbidden_403;

        res.status(httpStatus).send(
            createErrorMessages([
                {
                    status: httpStatus,
                    detail: error.message,
                },
            ]),
        );

        return;
    }

    if (error instanceof DomainError) {
        const httpStatus = HttpStatuses.Conflict_409;

        res.status(httpStatus).send(
            createErrorMessages([
                {
                    status: httpStatus,
                    source: error.source,
                    detail: error.message,
                    code: error.code,
                },
            ]),
        );

        return;
    }

    res.status(HttpStatuses.InternalServerError_500).send({ message: "Internal Server Error" });
    return;
}