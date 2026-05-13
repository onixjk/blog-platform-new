import {ObjectId, WithId} from "mongodb";
import {userCollection} from "../../../db/mongo.db";
import {RepositoryNotFoundError} from "../../../core/errors/repository-not-found.error";
import {IUserDB} from "../types/user.db.interface";
import {User} from "../types/user";

export const usersRepository = {

    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<IUserDB> | null> {
        return userCollection.findOne({
            $or: [{email: loginOrEmail}, {login: loginOrEmail}],
        });
    },

    async findByIdOrFail(id: string): Promise<WithId<User>> {
        const res = await userCollection.findOne({_id: new ObjectId(id)});

        if (!res) {
            throw new RepositoryNotFoundError('User not exist');
        }

        return res;
    },

    async create(newUser: IUserDB): Promise<string> {
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