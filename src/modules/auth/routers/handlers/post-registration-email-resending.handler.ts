import { Request, Response } from "express";
import { RegistrationEmailResending } from "../../types/registration-email-resending";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { authService } from "../../../../composition-root";

export async function registrationEmailResendingHandler(
    req: Request<{}, {}, RegistrationEmailResending>,
    res: Response,
) {
    const { email } = req.body;

    const result = await authService.resendEmailConfirmationCode(email)

    if (result.status !== ResultStatus.NoContent)
        return res
            .status(resultCodeToHttpException(result.status))
            .send({ errorsMessages: result.extensions });

    return res.status(HttpStatuses.NoContent_204).send(result.data);
}