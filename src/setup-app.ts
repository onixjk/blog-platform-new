
import express, { Express } from "express";
import {AUTH_PATH, BLOGS_PATH, COMMENTS_PATH, POSTS_PATH, TESTING_PATH, USERS_PATH} from "./core/paths/paths";
import {blogRouter} from "./modules/blog/routers/blog.router";
import {testingRouter} from "./modules/testing/routers/testing.router";
import {postRouter} from "./modules/post/routers/post.routers";
import cors from 'cors';
import {userRouter} from "./modules/user/routers/user.routers";
import {authRouter} from "./auth/routers/auth.routers";

export const setupApp = (app: Express) => {

    app.use(cors());
    app.use(express.json());

    app.use(BLOGS_PATH, blogRouter)
    app.use(POSTS_PATH, postRouter)
    app.use(USERS_PATH, userRouter)
    app.use(COMMENTS_PATH, userRouter)
    app.use(TESTING_PATH, testingRouter)
    app.use(AUTH_PATH, authRouter)


    return app;
};