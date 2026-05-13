import {User} from "../types/user";
import {userCollection} from "../../../db/mongo.db";
import {WithId} from "mongodb";
import {UserQueryInput} from "../routers/input/user-query.input";
import {UserOutput} from "../routers/output/user-output";
import {IPagination} from "../types/pagination";

export const usersQueryRepository = {

    async findMany(
        queryDto: UserQueryInput
    // ): Promise<{ items: WithId<User>[], totalCount: number }> {
    ): Promise<IPagination<User[]>> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        } = queryDto;

        const skip = (pageNumber - 1) * pageSize;
        const filter: any = {};

        const users = await userCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await userCollection.countDocuments(filter);

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: users.map((user) => this.mapToUserOutput(user)),
        }
    },

    mapToUserOutput(user: WithId<User>): UserOutput {
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt.toString(),
        }
    }
    }