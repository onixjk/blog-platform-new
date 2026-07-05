import { Request, Response } from 'express';
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { PostQueryInput } from "../../types/input/post-query.input";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../../core/helpers/set-default-sort-and-pagination";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { postsQueryRepository } from "../../../../composition-root";

export async function getPostListHandler(
    req: Request,
    res: Response,
) {
    try {
        const sanitizedQuery = matchedData<PostQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });

        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const postsListOutput = await postsQueryRepository.findMany(queryInput);

        res.status(HttpStatuses.Ok_200).send(postsListOutput)
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}