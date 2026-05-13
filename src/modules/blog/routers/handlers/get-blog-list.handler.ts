import {Request, Response} from 'express';
import {BlogQueryInput} from "../input/blog-query.input";
import {matchedData} from "express-validator";
import {setDefaultSortAndPaginationIfNotExist} from "../../../../core/helpers/set-default-sort-and-pagination";
import {blogsService} from "../../application/blogs.service";
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {HttpStatus} from "../../../../core/types/http-statuses";

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

        const blogsListOutput = await blogsService.findMany(queryInput);

        res.status(HttpStatus.Ok_200).send(blogsListOutput);
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}