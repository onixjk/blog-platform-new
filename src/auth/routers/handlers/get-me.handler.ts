import {Request, Response} from 'express';
import {HttpStatuses} from "../../../core/types/http-statuses";
import {usersQueryRepository} from "../../../modules/user/repositories/users.query.repository";

export async function getMeHandler(
    req: Request,
    res: Response
) {
    const userId = req.user?.id as string;

    if (!userId) return res.sendStatus(HttpStatuses.Unauthorized_401);

    const me = await usersQueryRepository.findMeById(userId);

    return res.status(HttpStatuses.Ok_200).send(me);
}