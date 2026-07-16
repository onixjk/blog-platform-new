import { Blog } from "../types/blog";
import { injectable } from "inversify";
import { BlogModel } from "../../../db/mongo.db";
import { HydratedDocument } from "mongoose";

@injectable()
export class BlogRepository {

    async findById(id: string): Promise<HydratedDocument<Blog> | null> {
        return BlogModel.findById(id);
    }

    async save(document: HydratedDocument<Blog>): Promise<string> {
        const savedBlog = await document.save();

        return savedBlog.id;
    }

    async delete(id: string): Promise<boolean> {
        const deleteResult = await BlogModel.deleteOne({ _id: id });

        return deleteResult.deletedCount > 0;
    }
}