import {Request, Response} from "express";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {HttpStatus} from "../../../../core/types/http-statuses";
import {mapToUserOutput} from "../mapers/map-to-user-output.util";
import {usersService} from "../../application/usersService";
import {UserInputDto} from "../input/user.input-dto";

export async function createUserHandler(
    req: Request<{}, {}, UserInputDto>,
    res: Response
) {
    try {
        const createdUserId = await usersService.create(req.body);

        const createdUser = await usersService.findByIdOrFail(createdUserId);
        const userOutput = mapToUserOutput(createdUser);

        res.status(HttpStatus.Created_201).send(userOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}