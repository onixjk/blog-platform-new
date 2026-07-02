import { Request, Response } from "express";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { UserInputDto } from "../input/user.input-dto";
import { usersQueryRepository, usersService } from "../../../../composition-root";

export async function createUserHandler(
    req: Request<{}, {}, UserInputDto>,
    res: Response
) {
    try {
        const createdUserId = await usersService.create(req.body);

        await usersService.findByIdOrFail(createdUserId);

        const userOutput = await usersQueryRepository.findById(createdUserId)

        res.status(HttpStatuses.Created_201).send(userOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}