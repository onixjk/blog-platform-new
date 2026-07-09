import { Request, Response } from 'express';
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { UserQueryRepository } from "../../../user/repositories/user.query.repository";

export const getMeHandler = (
    userQueryRepository: UserQueryRepository,
) => async (
    req: Request,
    res: Response
) => {
    const userId = req.user?.id as string;

    if (!userId) return res.sendStatus(HttpStatuses.Unauthorized_401);

    const me = await userQueryRepository.findMeById(userId);

    return res.status(HttpStatuses.Ok_200).send(me);
}