import { Request, Response } from "express";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { UserInputDto } from "../../types/input/user.input-dto";
import { UserService } from "../../application/user.service";
import { UserQueryRepository } from "../../repositories/user.query.repository";

export const createUserHandler = (
    userService: UserService,
    userQueryRepository: UserQueryRepository,
) => async (
    req: Request<{}, {}, UserInputDto>,
    res: Response
) => {
    try {
        const createdUserId = await userService.create(req.body);

        await userService.findByIdOrFail(createdUserId);

        const userOutput = await userQueryRepository.findById(createdUserId)

        res.status(HttpStatuses.Created_201).send(userOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}