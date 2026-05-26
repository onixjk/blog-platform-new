import {blogCollection} from "../../../db/mongo.db";
import {BlogQueryInput} from "../routes/input/blog-query.input";
import {mapToBlogListPaginatedOutput} from "../routes/mapers/map-to-blog-list-paginated-output.util";
import {BlogListPaginatedOutput} from "../routes/output/blog-list-paginated.output.ts";
import {ObjectId} from "mongodb";
import {mapToBlogOutput} from "../routes/mapers/map-to-blog-output.util";
import {BlogOutput} from "../routes/output/blog-output";

export const blogsQueryRepository = {
    async findMany(
        queryDto: BlogQueryInput
    ): Promise<BlogListPaginatedOutput> {
        const {pageNumber, pageSize, sortBy, sortDirection, searchNameTerm: searchNameTerm} = queryDto;
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

    async findById(id: string): Promise<BlogOutput | null> {
        const blog = await blogCollection.findOne({_id: new ObjectId(id)});

        return blog ? mapToBlogOutput(blog) : null;
    },
}