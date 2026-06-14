import {Request, Response, Router} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {
    blogCollection,
    commentCollection,
    postCollection,
    tokensCollection,
    userCollection
} from "../../../db/mongo.db";

export const testingRouter = Router();

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    try {
        await postCollection.deleteMany({});
        await blogCollection.deleteMany({});
        await userCollection.deleteMany({});
        await commentCollection.deleteMany({});
        await tokensCollection.deleteMany({});

        res.sendStatus(HttpStatuses.NoContent_204)
    } catch (e: unknown) {
        res.sendStatus(HttpStatuses.InternalServerError_500)
    }
});