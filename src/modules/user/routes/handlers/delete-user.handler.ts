import { Request, Response } from 'express';
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { UserService } from "../../application/user.service";

export const deleteUserHandler = (
    userService: UserService,
) => async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const id = req.params.id;

        await userService.delete(id);

        res.sendStatus(HttpStatuses.NoContent_204);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}