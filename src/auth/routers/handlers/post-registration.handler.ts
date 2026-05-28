import {Request, Response} from "express";
import {UserInputDto} from "../../../modules/user/routes/input/user.input-dto";
import {authService} from "../../application/authService";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {ResultStatus} from "../../../core/result/resultCode";
import {resultCodeToHttpException} from "../../../core/result/resultCodeToHttpException";
import {errorsHandler} from "../../../core/errors/errors.handler";

export async function registrationHandler(
    req: Request<{}, {}, UserInputDto>,
    res: Response,
) {
    try {
        const {login, password, email} = req.body;

        const result = await authService.registerUser(login, password, email);

        if (result.status !== ResultStatus.NoContent)
            return res.status(resultCodeToHttpException(result.status)).send(result.extensions);

        return res.status(HttpStatuses.NoContent_204).send(result.data);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}