
import express, { Express } from "express";
import {AUTH_PATH, BLOGS_PATH, COMMENTS_PATH, POSTS_PATH, TESTING_PATH, USERS_PATH} from "./core/paths/paths";
import {blogRouter} from "./modules/blog/routes/blog.router";
import {testingRouter} from "./modules/testing/routers/testing.router";
import {postRouter} from "./modules/post/routes/post.routers";
import cors from 'cors';
import {userRouter} from "./modules/user/routes/user.routers";
import {authRouter} from "./auth/routers/auth.routers";
import {commentRouter} from "./modules/comment/routes/comment.router";

export const setupApp = (app: Express) => {

    app.use(cors());
    app.use(express.json());

    app.use(BLOGS_PATH, blogRouter)
    app.use(POSTS_PATH, postRouter)
    app.use(USERS_PATH, userRouter)
    app.use(COMMENTS_PATH, commentRouter)
    app.use(TESTING_PATH, testingRouter)
    app.use(AUTH_PATH, authRouter)


    return app;
};