import {Request, Response} from "express";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {LoginInputDto} from "../../types/login.input-dto";
import {authService} from "../../application/authService";
import {HttpStatus} from "../../../core/types/http-statuses";

export async function loginUserHandler(
    req: Request<{}, {}, LoginInputDto>,
    res: Response,
) {
    try {
        const {loginOrEmail, password} = req.body;
        const accessToken = await authService.loginUser(loginOrEmail, password);

        if (!accessToken)
            res.sendStatus(HttpStatus.Unauthorized_401);

        res.sendStatus(HttpStatus.NoContent_204);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}