import {Blog} from "../types/blog";
import {blogCollection} from "../../../db/mongo.db";
import {ObjectId, WithId} from "mongodb";
import {RepositoryNotFoundError} from "../../../core/errors/repository-not-found.error";
import {BlogQueryInput} from "../routers/input/blog-query.input";

export const blogsQueryRepository = {
    async findMany(
        queryDto: BlogQueryInput
    ): Promise<{ items: WithId<Blog>[], totalCount: number }> {
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

        return {items, totalCount};
    },
}