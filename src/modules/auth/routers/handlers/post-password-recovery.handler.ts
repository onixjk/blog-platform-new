import { Request, Response } from "express";
import { PasswordRecoveryInput } from "../../types/input/password-recovery.input";
import { authService } from "../../../../composition-root";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { HttpStatuses } from "../../../../core/types/http-statuses";

export async function passwordRecoveryHandler(
    req: Request<{}, {}, PasswordRecoveryInput>,
    res: Response,
) {
    const { email } = req.body;

    const result = await authService.resetPassword(email);

    if (result.status !== ResultStatus.NoContent_204)
        return res
            .status(resultCodeToHttpException(result.status))
            .send({ errorsMessages: result.extensions });

    return res.sendStatus(HttpStatuses.NoContent_204);
}