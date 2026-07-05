import { Request, Response } from "express";
import { ResultStatus } from "../../../../core/result/resultCode";
import { RegistrationConfirmationCodeInput } from "../../types/input/registration-confirmation-code.input";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { authService } from "../../../../composition-root";

export async function registrationConfirmationHandler(
    req: Request<{}, {}, RegistrationConfirmationCodeInput>,
    res: Response,
) {
    const { code } = req.body

    if (!code) {
        return res
            .status(HttpStatuses.BadRequest_400)
            .send({ errorsMessages: [{ field: 'code', message: 'Code is required' }] });
    }

    const result = await authService.confirmEmail(code);

    if (result.status !== ResultStatus.NoContent_204)
        return res
            .status(resultCodeToHttpException(result.status))
            .send({ errorsMessages: result.extensions });

    return res.status(HttpStatuses.NoContent_204).send(result.data);
}