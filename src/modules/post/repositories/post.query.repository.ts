import { PostQueryInput } from "../types/input/post-query.input";
import { PostListPaginatedOutput } from "../types/output/post-list-paginated.output";
import { mapToPostListPaginatedOutput } from "../routes/mapers/map-to-post-list-paginated-output.util";
import { PostOutput } from "../types/output/post-output";
import { mapToPostOutput } from "../routes/mapers/map-to-post-output.util";
import { injectable } from "inversify";
import { PostModel } from "../../../db/mongo.db";

@injectable()
export class PostQueryRepository {

    async findById(id: string): Promise<PostOutput | null> {
        const post = await PostModel.findById(id).lean();

        return post ? mapToPostOutput(post) : null;
    }

    async findMany(queryDto: PostQueryInput): Promise<PostListPaginatedOutput> {
        const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        const filter: any = {};

        const [items, totalCount] = await Promise.all([
            PostModel
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            PostModel
                .countDocuments(filter)
        ]);

        return mapToPostListPaginatedOutput(items, {
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            totalCount,
        });
    }

    async findPostsByBlog(queryDto: PostQueryInput, blogId: string): Promise<PostListPaginatedOutput> {
        const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        const filter = { 'blogId': blogId };

        const [items, totalCount] = await Promise.all([
            PostModel
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            PostModel
                .countDocuments(filter)
        ]);

        return mapToPostListPaginatedOutput(items, {
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            totalCount,
        });
    }
}