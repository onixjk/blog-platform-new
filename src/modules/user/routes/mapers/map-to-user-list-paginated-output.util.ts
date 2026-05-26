import {WithId} from 'mongodb';
import {UserOutput} from "../output/user-output";
import {User} from "../../types/user";
import {UserListPaginatedOutput} from "../output/user-list-paginated.output.ts";

export function mapToUserListPaginatedOutput(
    users: WithId<User>[],
    meta: { pageNumber: number; pageSize: number; totalCount: number },
): UserListPaginatedOutput {
    return {
        pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
        page: meta.pageNumber,
        pageSize: meta.pageSize,
        totalCount: meta.totalCount,
        items: users.map(
            (user): UserOutput => ({
                id: user._id.toString(),
                login: user.login,
                email: user.email,
                createdAt: user.createdAt,
            }),
        ),
    };
}