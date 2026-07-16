import express, { Express } from "express";
import {
    AUTH_PATH,
    BLOGS_PATH,
    COMMENTS_PATH,
    POSTS_PATH,
    SECURITY_PATH,
    TESTING_PATH,
    USERS_PATH
} from "./core/paths/paths";
import { blogRouter } from "./modules/blog/routes/blog.router";
import { testingRouter } from "./modules/testing/routers/testing.router";
import cors from 'cors';
import { commentRouter } from "./modules/comment/routes/comment.router";
import cookieParser from "cookie-parser";
import { deviceRouter } from "./modules/device/routes/device.router";
import { postRouter } from "./modules/post/routes/post.router";
import { userRouter } from "./modules/user/routes/user.router";
import { authRouter } from "./modules/auth/routers/auth.router";

export const setupApp = (app: Express) => {

    app.set('trust proxy', true);
    app.use(cors());
    app.use(express.json());
    app.use(cookieParser())

    app.use(BLOGS_PATH, blogRouter)
    app.use(POSTS_PATH, postRouter)
    app.use(USERS_PATH, userRouter)
    app.use(COMMENTS_PATH, commentRouter)
    app.use(TESTING_PATH, testingRouter)
    app.use(AUTH_PATH, authRouter)
    app.use(SECURITY_PATH, deviceRouter)

    return app;
};