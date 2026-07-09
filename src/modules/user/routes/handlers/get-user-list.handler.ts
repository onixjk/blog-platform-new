import { Request, Response } from 'express';
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../../core/helpers/set-default-sort-and-pagination";
import { UserQueryInput } from "../../types/input/user-query.input";
import { UserQueryRepository } from "../../repositories/user.query.repository";

export const getUserListHandler = (
    userQueryRepository: UserQueryRepository,
) => async (
    req: Request,
    res: Response,
) => {
    try {
        const sanitizedQuery = matchedData<UserQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });

        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const usersListOutput = await userQueryRepository.findMany(queryInput);

        res.status(HttpStatuses.Ok_200).send(usersListOutput)
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}