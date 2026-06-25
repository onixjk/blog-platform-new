import {Request, Response, Router} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {
    apiRequestsCollection,
    blogCollection,
    commentCollection,
    postCollection,
    sessionCollection,
    userCollection
} from "../../../db/mongo.db";

export const testingRouter = Router();

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    try {
        await Promise.all([
            postCollection.deleteMany({}),
            blogCollection.deleteMany({}),
            userCollection.deleteMany({}),
            commentCollection.deleteMany({}),
            sessionCollection.deleteMany({}),
            apiRequestsCollection.deleteMany({})
        ]);

        res.sendStatus(HttpStatuses.NoContent_204)
    } catch (e: unknown) {
        res.sendStatus(HttpStatuses.InternalServerError_500)
    }
});