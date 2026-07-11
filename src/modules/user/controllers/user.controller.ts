import { inject, injectable } from "inversify";
import { UserQueryRepository } from "../repositories/user.query.repository";
import { Request, Response } from "express";
import { HttpStatuses } from "../../../core/types/http-statuses";
import { UserInputDto } from "../types/input/user.input-dto";
import { errorsHandler } from "../../../core/errors/errors.handler";
import { UserService } from "../application/user.service";
import { matchedData } from "express-validator";
import { UserQueryInput } from "../types/input/user-query.input";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-and-pagination";

@injectable()
export class UserController {

    constructor(
        @inject(UserQueryRepository) private userQueryRepository: UserQueryRepository,
        @inject(UserService) private userService: UserService,
    ) {}

    async createUser(req: Request<{}, {}, UserInputDto>, res: Response) {
        try {
            const createdUserId = await this.userService.create(req.body);

            await this.userService.findByIdOrFail(createdUserId);

            const userOutput = await this.userQueryRepository.findById(createdUserId)

            res.status(HttpStatuses.Created_201).send(userOutput);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async deleteUser(req: Request<{ id: string }>, res: Response) {
        try {
            const id = req.params.id;

            await this.userService.delete(id);

            res.sendStatus(HttpStatuses.NoContent_204);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async getUserList(req: Request, res: Response,) {
        try {
            const sanitizedQuery = matchedData<UserQueryInput>(req, {
                locations: ['query'],
                includeOptionals: true,
            });

            const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

            const usersListOutput = await this.userQueryRepository.findMany(queryInput);

            res.status(HttpStatuses.Ok_200).send(usersListOutput)
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }
}