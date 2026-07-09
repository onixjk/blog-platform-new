import {postCollection} from "../../../db/mongo.db";
import {PostQueryInput} from "../types/input/post-query.input";
import {PostListPaginatedOutput} from "../types/output/post-list-paginated.output";
import {mapToPostListPaginatedOutput} from "../routes/mapers/map-to-post-list-paginated-output.util";
import {ObjectId} from "mongodb";
import {PostOutput} from "../types/output/post-output";
import {mapToPostOutput} from "../routes/mapers/map-to-post-output.util";
import { injectable } from "inversify";

@injectable()
export class PostQueryRepository {

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
    }

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
    }

    async findById(id: string): Promise<PostOutput | null> {
        const post = await postCollection.findOne({_id: new ObjectId(id)});

        return post ? mapToPostOutput(post) : null;
    }
}