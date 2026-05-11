import {Request, Response} from 'express';
import {errorsHandler} from "../../../../core/errors/errors.handler";
import {HttpStatus} from "../../../../core/types/http-statuses";
import {matchedData} from "express-validator";
import {setDefaultSortAndPaginationIfNotExist} from "../../../../core/helpers/set-default-sort-and-pagination";
import {mapToUserListPaginatedOutput} from "../mapers/map-to-user-list-paginated-output.util";
import {UserQueryInput} from "../input/user-query.input";
import {usersService} from "../../application/usersService";

export async function getUserListHandler(
    req: Request,
    res: Response,
) {
    try {
        const sanitizedQuery = matchedData<UserQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });

        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const {items, totalCount} = await usersService.findMany(queryInput);

        const usersListOutput = mapToUserListPaginatedOutput(items, {
            pageNumber: queryInput.pageNumber,
            pageSize: queryInput.pageSize,
            totalCount,
        });

        res.status(HttpStatus.Ok_200).send(usersListOutput)
    } catch (e: unknown) {
        errorsHandler(e, res);
    }
}