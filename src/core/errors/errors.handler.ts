import { Response } from 'express';
import { RepositoryNotFoundError } from './repository-not-found.error';
import { HttpStatus } from '../types/http-statuses';
import { DomainError } from './domain.error';
import { createErrorMessages } from "../middlewares/validation/input-validtion-result.middleware";

export function errorsHandler(error: unknown, res: Response): void {
    if (error instanceof RepositoryNotFoundError) {
        const httpStatus = HttpStatus.NotFound_404;

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
        const httpStatus = HttpStatus.Conflict_409;

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

    res.status(HttpStatus.InternalServerError_500);
    return;
}