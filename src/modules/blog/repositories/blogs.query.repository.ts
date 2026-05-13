import {blogCollection} from "../../../db/mongo.db";
import {BlogQueryInput} from "../routers/input/blog-query.input";
import {mapToBlogListPaginatedOutput} from "../routers/mapers/map-to-blog-list-paginated-output.util";
import {BlogListPaginatedOutput} from "../routers/output/blog-list-paginated.output.ts";

export const blogsQueryRepository = {
    async findMany(
        queryDto: BlogQueryInput
    ): Promise<BlogListPaginatedOutput> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm: searchNameTerm,
        } = queryDto;

        const skip = (pageNumber - 1) * pageSize;
        const filter: any = {};

        if (searchNameTerm) {
            filter.name = {$regex: searchNameTerm, $options: 'i'};
        }

        const items = await blogCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await blogCollection.countDocuments(filter);

        return mapToBlogListPaginatedOutput(items, {
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            totalCount,
        });
    },
}