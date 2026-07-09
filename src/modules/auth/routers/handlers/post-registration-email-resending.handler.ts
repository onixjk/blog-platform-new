import { Request, Response } from "express";
import { RegistrationEmailResendingInput } from "../../types/input/registration-email-resending.input";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { AuthService } from "../../application/auth.service";

export const registrationEmailResendingHandler = (
    authService: AuthService,
) => async (
    req: Request<{}, {}, RegistrationEmailResendingInput>,
    res: Response,
) => {
    const { email } = req.body;

    const result = await authService.resendEmailConfirmationCode(email)

    if (result.status !== ResultStatus.NoContent_204)
        return res
            .status(resultCodeToHttpException(result.status))
            .send({ errorsMessages: result.extensions });

    return res.status(HttpStatuses.NoContent_204).send(result.data);
}