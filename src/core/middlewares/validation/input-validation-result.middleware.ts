import {ValidationErrorType} from "../../types/validationError";
import {FieldValidationError, ValidationError, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {HttpStatuses} from "../../types/http-statuses";

export const createErrorMessages = (errors: ValidationErrorType[]) => {
    return {
        errorsMessages: errors.map((error) => ({
            message: error.detail,
            field: error.source,
        })),
    };
};

const formatValidationError = (error: ValidationError): ValidationErrorType => {
    const expressError = error as FieldValidationError;

    return {
        status: HttpStatuses.BadRequest_400,
        source: expressError.path,
        detail: expressError.msg,
    };
};

export const inputValidationResultMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const errors = validationResult(req)
        .formatWith(formatValidationError)
        .array({onlyFirstError: true});

    if (errors.length > 0) {
        res.status(HttpStatuses.BadRequest_400).json(createErrorMessages(errors));
        return;
    }
    next();
};