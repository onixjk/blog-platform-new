import { User } from "../types/user";
import { UserQueryInput } from "../types/input/user-query.input";
import { UserOutput } from "../types/output/user-output";
import { IPagination } from "../types/pagination";
import { mapToUserListPaginatedOutput } from "../routes/mapers/map-to-user-list-paginated-output.util";
import { mapToUserOutput } from "../routes/mapers/map-to-user-output.util";
import { MeOutput } from "../../auth/types/output/me-output";
import { mapToMeOutput } from "../../auth/mapers/map-to-me-output.util";
import { injectable } from "inversify";
import { UserModel } from "../../../db/mongo.db";

@injectable()
export class UserQueryRepository {

    async findById(id: string): Promise<UserOutput | null> {
        const user = await UserModel.findById(id).lean();

        return user ? mapToUserOutput(user) : null;
    }

    async findMeById(id: string): Promise<MeOutput | null> {
        const user = await UserModel.findById(id).lean();

        return user ? mapToMeOutput(user) : null;
    }

    async findMany(queryDto: UserQueryInput): Promise<IPagination<User[]>> {

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

        const [items, totalCount] = await Promise.all([
            UserModel
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            UserModel
                .countDocuments(filter)
        ])

        return mapToUserListPaginatedOutput(items, {
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            totalCount,
        });
    }
}