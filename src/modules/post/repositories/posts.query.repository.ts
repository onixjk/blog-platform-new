import {postCollection} from "../../../db/mongo.db";
import {PostQueryInput} from "../routers/input/post-query.input";
import {PostListPaginatedOutput} from "../routers/output/post-list-paginated.output";
import {mapToPostListPaginatedOutput} from "../routers/mapers/map-to-post-list-paginated-output.util";
import {ObjectId} from "mongodb";
import {PostOutput} from "../routers/output/post-output";
import {mapToPostOutput} from "../routers/mapers/map-to-post-output.util";

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

    async findById(id: string): Promise<PostOutput | null> {
        const post = await postCollection.findOne({_id: new ObjectId(id)});

        return post ? mapToPostOutput(post) : null;
    },
}