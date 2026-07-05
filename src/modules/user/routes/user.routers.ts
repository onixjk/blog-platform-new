import {Router} from 'express';
import {superAdminGuardMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {
    paginationAndSortingValidation
} from "../../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import {UserSortField} from "../types/input/user-sort-field";
import {getUserListHandler} from "./handlers/get-user-list.handler";
import {inputValidationResultMiddleware} from "../../../core/middlewares/validation/input-validation-result.middleware";
import {userInputValidation} from "../middlewares/user.input-dto.validation-middlewares";
import {createUserHandler} from "./handlers/create-user.handler";
import {idValidation} from "../../../core/middlewares/validation/params-id.validation-middleware";
import {deleteUserHandler} from "./handlers/delete-user.handler";

export const userRouter = Router({});

userRouter
    .get('',
        superAdminGuardMiddleware,
        paginationAndSortingValidation(UserSortField),
        inputValidationResultMiddleware,
        getUserListHandler,
    )

    .post('',
        superAdminGuardMiddleware,
        userInputValidation,
        inputValidationResultMiddleware,
        createUserHandler,
    )

    .delete('/:id',
        superAdminGuardMiddleware,
        idValidation,
        inputValidationResultMiddleware,
        deleteUserHandler,
    );