import {Request, Response} from "express";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {LoginInputDto} from "../../input/login.input-dto";
import {authService} from "../../application/authService";
import {HttpStatuses} from "../../../core/types/http-statuses";

export async function loginUserHandler(
    req: Request<{}, {}, LoginInputDto>,
    res: Response,
) {
    try {
        const {loginOrEmail, password} = req.body;
        const accessToken = await authService.loginUser(loginOrEmail, password);

        if (!accessToken)
            res.sendStatus(HttpStatuses.Unauthorized_401);

        res.status(HttpStatuses.NoContent_204).send(accessToken);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}