import { Router } from 'express';
import { superAdminGuardMiddleware } from "../../auth/middlewares/super-admin.guard-middleware";
import {
    paginationAndSortingValidation
} from "../../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import { UserSortField } from "../types/input/user-sort-field";
import { getUserListHandler } from "./handlers/get-user-list.handler";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { userInputValidation } from "../middlewares/user.input-dto.validation-middlewares";
import { createUserHandler } from "./handlers/create-user.handler";
import { idValidation } from "../../../core/middlewares/validation/params-id.validation-middleware";
import { deleteUserHandler } from "./handlers/delete-user.handler";
import { container } from "../../../composition-root";
import { UserQueryRepository } from "../repositories/user.query.repository";
import { UserService } from "../application/user.service";

export const userRouter = Router({});

const userQueryRepository = container.get(UserQueryRepository);
const userService = container.get(UserService);

userRouter
    .get('',
        superAdminGuardMiddleware,
        paginationAndSortingValidation(UserSortField),
        inputValidationResultMiddleware,
        getUserListHandler(userQueryRepository),
    )

    .post('',
        superAdminGuardMiddleware,
        userInputValidation,
        inputValidationResultMiddleware,
        createUserHandler(userService, userQueryRepository),
    )

    .delete('/:id',
        superAdminGuardMiddleware,
        idValidation,
        inputValidationResultMiddleware,
        deleteUserHandler(userService),
    );