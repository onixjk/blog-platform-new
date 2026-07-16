import { Post } from "../types/post";
import { injectable } from "inversify";
import { PostModel } from "../../../db/mongo.db";
import { HydratedDocument } from "mongoose";

@injectable()
export class PostRepository {

    async findById(id: string): Promise<HydratedDocument<Post> | null> {
        return PostModel.findById(id);
    }

    async save(document: HydratedDocument<Post>): Promise<string> {
        const savedPost = await document.save();

        return savedPost.id;
    }

    async updateAllBlogNames(blogId: string, blogName: string): Promise<boolean> {
        const updateAllResult = await PostModel.updateMany(
            { blogId: blogId },
            { blogName: blogName }
        );

        return updateAllResult.acknowledged;
    }

    async delete(id: string): Promise<boolean> {
        const deleteResult = await PostModel.deleteOne({ _id: id });

        return deleteResult.deletedCount > 0;
    }

    async deleteAllByBlogId(blogId: string): Promise<boolean> {
        const deleteResult = await PostModel.deleteMany({ blogId: blogId });

        return deleteResult.acknowledged;
    }
}