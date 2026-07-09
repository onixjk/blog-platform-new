import { Request, Response } from "express";
import { PasswordRecoveryInput } from "../../types/input/password-recovery.input";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { AuthService } from "../../application/auth.service";

export const passwordRecoveryHandler = (
    authService: AuthService,
) => async (
    req: Request<{}, {}, PasswordRecoveryInput>,
    res: Response,
) => {
    const { email } = req.body;

    const result = await authService.sendPasswordRecoveryCode(email);

    if (result.status !== ResultStatus.NoContent_204)
        return res
            .status(resultCodeToHttpException(result.status))
            .send({ errorsMessages: result.extensions });

    return res.sendStatus(HttpStatuses.NoContent_204);
}