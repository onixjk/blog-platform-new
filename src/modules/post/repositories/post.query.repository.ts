import {Post} from "../types/post";
import {postCollection} from "../../../db/mongo.db";
import {ObjectId, WithId} from "mongodb";
import {RepositoryNotFoundError} from "../../../core/errors/repository-not-found.error";
import {PostQueryInput} from "../routers/input/post-query.input";

export const postsQueryRepository = {

    async findMany(
        queryDto: PostQueryInput
    ): Promise<{ items: WithId<Post>[], totalCount: number }> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        } = queryDto;

        const skip = (pageNumber - 1) * pageSize;
        const filter: any = {};

        const items = await postCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();

        const totalCount = await postCollection.countDocuments(filter);

        return {items, totalCount};
    },

    async findPostsByBlog(
        queryDto: PostQueryInput,
        blogId: string,
    ): Promise<{ items: WithId<Post>[], totalCount: number }> {
        const {pageNumber, pageSize, sortBy, sortDirection} = queryDto;
        const filter = {'blogId': blogId};
        const skip = (pageNumber - 1) * pageSize;

        const [items, totalCount] = await Promise.all([
            postCollection
                .find(filter)
                .sort({[sortBy]: sortDirection})
                .skip(skip)
                .limit(pageSize)
                .toArray(),
            postCollection.countDocuments(filter),
        ]);

        return {items, totalCount};
    },

    async findByIdOrFail(id: string): Promise<WithId<Post>> {
        const res = await postCollection.findOne({_id: new ObjectId(id)});

        if (!res) {
            throw new RepositoryNotFoundError('Post not exist');
        }

        return res;
    },
}