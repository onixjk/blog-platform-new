import {User} from "../types/user";
import {userCollection} from "../../../db/mongo.db";
import {ObjectId, WithId} from "mongodb";
import {RepositoryNotFoundError} from "../../../core/errors/repository-not-found.error";
import {UserQueryInput} from "../routers/input/user-query.input";

export const userQueryRepository = {

    async findMany(
        queryDto: UserQueryInput
    ): Promise<{ items: WithId<User>[], totalCount: number }> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        } = queryDto;

        const skip = (pageNumber - 1) * pageSize;
        const filter: any = {};

        const items = await userCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await userCollection.countDocuments(filter);

        return {items, totalCount};
    },

    async findByIdOrFail(id: string): Promise<WithId<User>> {
        const res = await userCollection.findOne({_id: new ObjectId(id)});

        if (!res) {
            throw new RepositoryNotFoundError('User not exist');
        }

        return res;
    },

    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {
        return userCollection.findOne({
            $or: [{email: loginOrEmail}, {login: loginOrEmail}],
        });
    },
}