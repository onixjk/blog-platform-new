import { Request, Response } from "express";
import { PasswordRecovery } from "../../types/password-recovery";
import { authService } from "../../../../composition-root";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { HttpStatuses } from "../../../../core/types/http-statuses";

export async function passwordRecoveryHandler(
    req: Request<{}, {}, PasswordRecovery>,
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