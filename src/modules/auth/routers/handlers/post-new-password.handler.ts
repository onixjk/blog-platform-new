import { Request, Response } from "express";
import { NewPasswordRecoveryInput } from "../../types/input/new-password-recovery.input";
import { authService } from "../../../../composition-root";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { HttpStatuses } from "../../../../core/types/http-statuses";

export async function newPasswordHandler(
    req: Request<{}, {}, NewPasswordRecoveryInput>,
    res: Response,
) {
    const { newPassword, recoveryCode } = req.body;

    const result = await authService.updatePassword(newPassword, recoveryCode);

    if (result.status !== ResultStatus.Success_200)
        return res
            .status(resultCodeToHttpException(result.status))
            .send({ errorsMessages: result.extensions });

    return res.sendStatus(HttpStatuses.NoContent_204);
}