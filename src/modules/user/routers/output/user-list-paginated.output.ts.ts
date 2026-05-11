import {UserOutput} from "./user-output";

export type UserListPaginatedOutput = {
    page: number;
    pageSize: number;
    pagesCount: number;
    totalCount: number;
    items: UserOutput[];
};