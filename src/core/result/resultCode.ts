export enum ResultStatus {
    Success = 'Success',
    Created_201 = 'Created',
    NoContent_204 = 'NoContent',

    BadRequest_400 = 'BadRequest',
    Unauthorized_401 = 'Unauthorized',
    Forbidden_403 = 'Forbidden',
    NotFound_404 = 'NotFound',
    Conflict_409 = 'Conflict',
    TooManyRequests_429 = 'TooManyRequests_429',

    InternalServerError_500 = 'InternalServerError_500',
}