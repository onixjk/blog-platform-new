import { UserOutput } from "../../types/output/user-output";
import { User } from "../../types/user";
import { UserListPaginatedOutput } from "../../types/output/user-list-paginated.output";

export function mapToUserListPaginatedOutput(
    users: (User & { _id: any })[],
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