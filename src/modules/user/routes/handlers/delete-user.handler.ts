import { Request, Response } from 'express';
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { usersService } from "../../../../composition-root";

export async function deleteUserHandler(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const id = req.params.id;

        await usersService.delete(id);

        res.sendStatus(HttpStatuses.NoContent_204);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}