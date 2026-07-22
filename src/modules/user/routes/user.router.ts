import { Router } from 'express';
import {
    paginationAndSortingValidation
} from "../../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import { UserSortField } from "../types/input/user-sort-field";
import {
    inputValidationResultMiddleware
} from "../../../core/middlewares/validation/input-validation-result.middleware";
import { userInputValidation } from "../middlewares/user.input-dto.validation-middlewares";
import { idValidation } from "../../../core/middlewares/validation/params-id.validation-middleware";
import { container } from "../../../composition-root";
import { UserController } from "../controllers/user.controller";
import { superAdminGuardMiddleware } from "../../auth/middlewares/super-admin.guard";

export const userRouter = Router({});

const userController = container.get(UserController);

userRouter
    .get('',
        superAdminGuardMiddleware,
        paginationAndSortingValidation(UserSortField),
        inputValidationResultMiddleware,
        userController.getUserList.bind(userController),
    )

    .post('',
        superAdminGuardMiddleware,
        userInputValidation,
        inputValidationResultMiddleware,
        userController.createUser.bind(userController),
    )

    .delete('/:id',
        superAdminGuardMiddleware,
        idValidation,
        inputValidationResultMiddleware,
        userController.deleteUser.bind(userController),
    );