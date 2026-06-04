import {Request, Response} from "express";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {LoginInputDto} from "../../input/login.input-dto";
import {authService} from "../../application/authService";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {ResultStatus} from "../../../core/result/resultCode";
import {resultCodeToHttpException} from "../../../core/result/resultCodeToHttpException";

export async function loginUserHandler(
    req: Request<{}, {}, LoginInputDto>,
    res: Response,
) {
    try {
        const {loginOrEmail, password} = req.body;

        const result = await authService.loginUser(loginOrEmail, password);

        if (result.status !== ResultStatus.Success) {
            return res.status(resultCodeToHttpException(result.status)).send(result.extensions);
        }

        res.cookie('cookie_name', result.data!.refreshToken, {httpOnly: true,secure: true})
        res.status(HttpStatuses.Ok_200).send({accessToken: result.data!.accessToken});
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}