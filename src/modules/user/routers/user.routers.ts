import {Router} from 'express';

export const userRouter = Router({});

userRouter
    .get('',
        // paginationAndSortingValidation(PostSortField),
        // inputValidationResultMiddleware,
        // getUserListHandler,
    )

    .post('',
        // superAdminGuardMiddleware,
        // postInputValidation,
        // inputValidationResultMiddleware,
        // createUserHandler,
    )

    .delete('/:id',
        // superAdminGuardMiddleware,
        // idValidation,
        // inputValidationResultMiddleware,
        // deleteUserHandler,
    );