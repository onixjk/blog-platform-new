import { Request, Response } from "express";
import { UserInputDto } from "../../../user/types/input/user.input-dto";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { ResultStatus } from "../../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../../core/result/resultCodeToHttpException";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { authService } from "../../../../composition-root";

export async function registrationHandler(
    req: Request<{}, {}, UserInputDto>,
    res: Response,
) {
    try {
        const { login, password, email } = req.body;

        const result = await authService.registerUser(login, password, email);

        if (result.status !== ResultStatus.NoContent_204)
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });

        return res.status(HttpStatuses.NoContent_204).send(result.data);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}