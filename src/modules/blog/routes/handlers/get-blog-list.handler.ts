import { Request, Response } from 'express';
import { BlogQueryInput } from "../../types/input/blog-query.input";
import { matchedData } from "express-validator";
import { setDefaultSortAndPaginationIfNotExist } from "../../../../core/helpers/set-default-sort-and-pagination";
import { errorsHandler } from "../../../../core/errors/errors.handler";
import { HttpStatuses } from "../../../../core/types/http-statuses";
import { blogsQueryRepository } from "../../../../composition-root";

export async function getBlogListHandler(
    req: Request,
    res: Response
) {
    try {
        const sanitizedQuery = matchedData<BlogQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });

        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const blogsListOutput = await blogsQueryRepository.findMany(queryInput);

        res.status(HttpStatuses.Ok_200).send(blogsListOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}