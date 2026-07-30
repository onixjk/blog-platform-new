import { Request, Response, Router } from "express";
import { HttpStatuses } from "../../../core/types/http-statuses";
import mongoose from "mongoose";


export const testingRouter = Router();

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    try {
        // await Promise.all([
        //     PostModel.deleteMany({}),
        //     BlogModel.deleteMany({}),
        //     UserModel.deleteMany({}),
        //     CommentModel.deleteMany({}),
        //     SessionModel.deleteMany({}),
        //     ApiRequestsModel.deleteMany({}),
        //     CommentLikeModel.deleteMany({}),
        //     PostLikeModel.deleteMany({}),
        // ]);

        await mongoose.connection.dropDatabase();

        res.sendStatus(HttpStatuses.NoContent_204)
    } catch (e: unknown) {
        res.sendStatus(HttpStatuses.InternalServerError_500)
    }
});