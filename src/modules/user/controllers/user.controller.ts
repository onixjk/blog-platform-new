import { inject, injectable } from "inversify";
import { UserQueryRepository } from "../repositories/user.query.repository";
import { Request, Response } from "express";
import { HttpStatuses } from "../../../core/types/http-statuses";
import { UserInputDto } from "../types/input/user.input-dto";
import { UserService } from "../application/user.service";
import { matchedData } from "express-validator";
import { UserQueryInput } from "../types/input/user-query.input";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-and-pagination";
import { ResultStatus } from "../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../core/result/resultCodeToHttpException";
import { UserRepository } from "../repositories/user.repository";

@injectable()
export class UserController {

    constructor(
        @inject(UserQueryRepository) private userQueryRepository: UserQueryRepository,
        @inject(UserRepository) private userRepository: UserRepository,
        @inject(UserService) private userService: UserService,
    ) {}

    async getUserList(req: Request, res: Response,) {

        const sanitizedQuery = matchedData<UserQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });
        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const usersListOutput = await this.userQueryRepository.findMany(queryInput);

        res.status(HttpStatuses.Ok_200).send(usersListOutput)

    }

    async createUser(req: Request<{}, {}, UserInputDto>, res: Response) {

        const createdUserId = await this.userService.create(req.body);
        if (createdUserId.status !== ResultStatus.Success || !createdUserId.data) {
            return res
                .status(resultCodeToHttpException(createdUserId.status))
                .send({ errorsMessages: createdUserId.extensions });
        }

        const userOutput = await this.userQueryRepository.findById(createdUserId.data)
        if (!userOutput) return res.sendStatus(HttpStatuses.BadRequest_400);

        res.status(HttpStatuses.Created_201).send(userOutput);
    }

    async deleteUser(req: Request<{ id: string }>, res: Response) {

        const id = req.params.id;
        if (!id) return res.sendStatus(HttpStatuses.NotFound_404);

        const result = await this.userService.delete(id);
        if (result.status !== ResultStatus.Success) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });
        }

        res.sendStatus(HttpStatuses.NoContent_204);
    }

}