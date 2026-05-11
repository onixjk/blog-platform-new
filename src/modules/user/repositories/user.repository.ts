import {ObjectId} from "mongodb";
import {userCollection} from "../../../db/mongo.db";
import {RepositoryNotFoundError} from "../../../core/errors/repository-not-found.error";
import {User} from "../types/user";

export const usersRepository = {

    async create(newUser: User): Promise<string> {
        const insertResult = await userCollection.insertOne(newUser);

        return insertResult.insertedId.toString()
    },

    async delete(id: string): Promise<void> {
        const deleteResult = await userCollection.deleteOne({_id: new ObjectId(id)});

        if (deleteResult.deletedCount < 1) {
            throw new RepositoryNotFoundError("User not exist");
        }

        return;
    }
}