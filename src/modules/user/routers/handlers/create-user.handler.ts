import {Request, Response} from "express";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {HttpStatus} from "../../../../core/types/http-statuses";
import {usersService} from "../../application/usersService";
import {UserInputDto} from "../input/user.input-dto";
import {usersQueryRepository} from "../../repositories/users.query.repository";

export async function createUserHandler(
    req: Request<{}, {}, UserInputDto>,
    res: Response
) {
    try {
        const createdUserId = await usersService.create(req.body);

        await usersService.findByIdOrFail(createdUserId);

        const userOutput = await usersQueryRepository.findById(createdUserId)

        res.status(HttpStatus.Created_201).send(userOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}