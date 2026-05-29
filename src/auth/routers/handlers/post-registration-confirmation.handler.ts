import {Request, Response} from "express";
import {RegistrationConfirmationCode} from "../../types/registration-confirmation-code";
import {authService} from "../../application/authService";
import {ResultStatus} from "../../../core/result/resultCode";
import {resultCodeToHttpException} from "../../../core/result/resultCodeToHttpException";
import {HttpStatuses} from "../../../core/types/http-statuses";

export async function registrationConfirmationHandler(
    req: Request<{}, {}, RegistrationConfirmationCode>,
    res: Response,
) {
    const {code} = req.body

    if (!code) {
        return res
            .status(HttpStatuses.BadRequest_400)
            .send({ errorsMessages: [{ field: 'code', message: 'Code is required' }] });
    }

    const result = await authService.confirmEmail(code);

    if (result.status !== ResultStatus.NoContent)
        return res
            .status(resultCodeToHttpException(result.status))
            .send({errorsMessages: result.extensions});

    return res.status(HttpStatuses.NoContent_204).send(result.data);
}