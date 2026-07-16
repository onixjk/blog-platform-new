import { BlogQueryInput } from "../types/input/blog-query.input";
import { mapToBlogListPaginatedOutput } from "../routes/mapers/map-to-blog-list-paginated-output.util";
import { BlogListPaginatedOutput } from "../types/output/blog-list-paginated.output";
import { mapToBlogOutput } from "../routes/mapers/map-to-blog-output.util";
import { BlogOutput } from "../types/output/blog-output";
import { injectable } from "inversify";
import { BlogModel } from "../../../db/mongo.db";

@injectable()
export class BlogQueryRepository {

    async findById(id: string): Promise<BlogOutput | null> {
        const blog = await BlogModel.findById(id).lean();

        return blog ? mapToBlogOutput(blog) : null;
    }

    async findMany(queryDto: BlogQueryInput): Promise<BlogListPaginatedOutput> {
        const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        const filter: any = {};

        if (searchNameTerm) {
            filter.name = { $regex: searchNameTerm, $options: 'i' };
        }

        const [items, totalCount] = await Promise.all([
            BlogModel
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            BlogModel
                .countDocuments(filter)
        ]);

        return mapToBlogListPaginatedOutput(items, {
            pageNumber: queryDto.pageNumber,
            pageSize: queryDto.pageSize,
            totalCount,
        });
    }
}