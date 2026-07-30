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

    async updateLikesCount(postId: string, likesModifier: number, dislikesModifier: number): Promise<boolean> {
        const result = await PostModel.updateOne(
            { _id: postId },
            {
                $inc: {
                    "extendedLikesInfo.likesCount": likesModifier,
                    "extendedLikesInfo.dislikesCount": dislikesModifier
                }
            }
        );
        return result.matchedCount > 0;
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

    async pushNewestLike(postId: string, userId: string, login: string): Promise<boolean> {
        const result = await PostModel.updateOne(
            { _id: postId },
            {
                $push: {
                    "extendedLikesInfo.newestLikes": {
                        $each: [{ addedAt: new Date(), userId, login }],
                        $sort: { addedAt: -1 },
                        $slice: 3
                    }
                }
            }
        );
        return result.matchedCount > 0;
    }

    async pullNewestLike(postId: string, userId: string): Promise<boolean> {
        const result = await PostModel.updateOne(
            { _id: postId },
            {
                $pull: {
                    "extendedLikesInfo.newestLikes": { userId: userId }
                }
            }
        );
        return result.matchedCount > 0;
    }

    async setNewestLikes(postId: string, newestLikes: any[]): Promise<boolean> {
        const result = await PostModel.updateOne(
            { _id: postId },
            { $set: { "extendedLikesInfo.newestLikes": newestLikes } }
        );
        return result.matchedCount > 0;
    }
}