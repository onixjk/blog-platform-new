import {ValidationErrorType} from "../../types/validationError";
import {FieldValidationError, ValidationError, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {HttpStatus} from "../../types/http-statuses";

// export const createErrorMessages = (
//     errors: ValidationErrorType[],
// ) => {
//     return {
//         errorsMessages: errors.map((error) => ({
//             message: error.detail,
//             field: error.source,
//         })),
//     };
// };
//
// const formatValidationError = (error: ValidationError): ValidationErrorType => {
//     const expressError = error as FieldValidationError;
//
//     return {
//         status: HttpStatus.BadRequest_400,
//         source: expressError.path,
//         detail: expressError.msg,
//     };
// };
//
// export const inputValidationResultMiddleware = (
//     req: Request<{}, {}, {}, {}>,
//     res: Response,
//     next: NextFunction,
// ) => {
//     const errors = validationResult(req)
//         .formatWith(formatValidationError)
//         .array({onlyFirstError: true});
//
//     if (errors.length > 0) {
//         res.status(HttpStatus.BadRequest_400).json(createErrorMessages(errors));
//         return;
//     }
//     next();
// };

export type ValidationErrorListOutput = {
    errorsMessages: Array<{
        message: string;
        field: string;
    }>;
};

// 2. Исправляем маппинг под формат теста
export const createErrorMessages = (
    errors: ValidationErrorType[],
): ValidationErrorListOutput => {
    return {
        // Тест ищет именно "errorsMessages"
        errorsMessages: errors.map((error) => ({
            message: error.detail, // Ваше сообщение об ошибке
            field: error.source ?? '',   // Ваше название поля (path)
        })),
    };
};

// 3. Форматируем ошибку из express-validator
const formatValidationError = (error: ValidationError): ValidationErrorType => {
    const expressError = error as FieldValidationError;

    return {
        status: 400,
        source: expressError.path, // Здесь будет строка, например "websiteUrl"
        detail: expressError.msg,  // Ваше сообщение, например "Invalid URL"
    };
};

// 4. Middleware остается почти таким же, но с новым форматом
export const inputValidationResultMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const errors = validationResult(req)
        .formatWith(formatValidationError)
        .array({ onlyFirstError: true });

    if (errors.length > 0) {
        // Отправляем объект с errorsMessages
        res.status(400).json(createErrorMessages(errors));
        return;
    }
    next();
};