import {ValidationErrorType} from "../../types/validationError";
import {FieldValidationError, ValidationError, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {HttpStatus} from "../../types/http-statuses";
import {ValidationErrorListOutput} from "../../types/validationError.dto";

export const createErrorMessages = (
    errors: ValidationErrorType[],
): ValidationErrorListOutput => {
    return {
        errors: errors.map((error) => ({
            status: error.status,
            detail: error.detail, //error message
            source: {pointer: error.source ?? ''}, //error field
            code: error.code ?? null, //domain error code
        })),
    };
};

const formatValidationError = (error: ValidationError): ValidationErrorType => {
    const expressError = error as unknown as FieldValidationError;

    return {
        status: HttpStatus.BadRequest_400,
        source: expressError.path,
        detail: expressError.msg,
    };
};

export const inputValidationResultMiddleware = (
    req: Request<{}, {}, {}, {}>,
    res: Response,
    next: NextFunction,
) => {
    const errors = validationResult(req)
        .formatWith(formatValidationError)
        .array({onlyFirstError: true});

    if (errors.length > 0) {
        res.status(HttpStatus.BadRequest_400).json(createErrorMessages(errors));
        return;
    }
    next();
};