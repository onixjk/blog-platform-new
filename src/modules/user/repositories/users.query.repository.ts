import { User } from "../types/user";
import { userCollection } from "../../../db/mongo.db";
import { ObjectId } from "mongodb";
import { UserQueryInput } from "../types/input/user-query.input";
import { UserOutput } from "../types/output/user-output";
import { IPagination } from "../types/pagination";
import { mapToUserListPaginatedOutput } from "../routes/mapers/map-to-user-list-paginated-output.util";
import { mapToUserOutput } from "../routes/mapers/map-to-user-output.util";
import { MeOutput } from "../../auth/types/output/me-output";
import { mapToMeOutput } from "../../auth/mapers/map-to-me-output.util";

export class UsersQueryRepository {

    async findMany(
        queryDto: UserQueryInput
    ): Promise<IPagination<User[]>> {
        const { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm } = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        const filter: any = {};

        const conditions = [
            searchLoginTerm ? { login: { $regex: searchLoginTerm, $options: 'i' } } : null,
            searchEmailTerm ? { email: { $regex: searchEmailTerm, $options: 'i' } } : null,
        ].filter(Boolean)

        if (conditions.length > 0) {
            filter.$or = conditions;
        }

        const items = await userCollection
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await userCollection.countDocuments(filter);

        return mapToUserListPaginatedOutput(items, {
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            totalCount,
        });
    }

    async findById(id: string): Promise<UserOutput | null> {
        const user = await userCollection.findOne({ _id: new ObjectId(id) });

        return user ? mapToUserOutput(user) : null;
    }

    async findMeById(id: string): Promise<MeOutput | null> {
        const user = await userCollection.findOne({ _id: new ObjectId(id) });

        return user ? mapToMeOutput(user) : null;
    }
}