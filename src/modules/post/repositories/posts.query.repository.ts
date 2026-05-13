import {postCollection} from "../../../db/mongo.db";
import {PostQueryInput} from "../routers/input/post-query.input";
import {PostListPaginatedOutput} from "../routers/output/post-list-paginated.output.ts";
import {mapToPostListPaginatedOutput} from "../routers/mapers/map-to-post-list-paginated-output.util";

export const postsQueryRepository = {

    async findMany(
        queryDto: PostQueryInput
    ): Promise<PostListPaginatedOutput> {
        const {pageNumber, pageSize, sortBy, sortDirection} = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        const filter: any = {};

        const items = await postCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await postCollection.countDocuments(filter);

        return mapToPostListPaginatedOutput(items, {
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            totalCount,
        });
    },

    async findPostsByBlog(
        queryDto: PostQueryInput,
        blogId: string,
    ): Promise<PostListPaginatedOutput> {
        const {pageNumber, pageSize, sortBy, sortDirection} = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        const filter = {'blogId': blogId};

        // const [items, totalCount] = await Promise.all([
        //     postCollection
        //         .find(filter)
        //         .sort({[sortBy]: sortDirection})
        //         .skip(skip)
        //         .limit(pageSize)
        //         .toArray(),
        //     postCollection.countDocuments(filter),
        // ]);

        const items = await postCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await postCollection.countDocuments(filter)

        return mapToPostListPaginatedOutput(items, {
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            totalCount,
        });
    },
}