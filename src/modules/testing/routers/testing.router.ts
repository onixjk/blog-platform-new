import {Router, Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {blogCollection, postCollection} from "../../../db/mongo.db";

export const testingRouter = Router();

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
    try {
        await postCollection.deleteMany({});
        await blogCollection.deleteMany({});

        res.sendStatus(HttpStatus.NoContent_204)
    } catch (e: unknown) {
        res.sendStatus(HttpStatus.InternalServerError_500)
    }
});