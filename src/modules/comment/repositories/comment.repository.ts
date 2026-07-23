import { Comment } from "../types/comment";
import { injectable } from "inversify";
import { CommentModel } from "../../../db/mongo.db";
import { HydratedDocument } from "mongoose";

@injectable()
export class CommentRepository {

    async findById(id: string): Promise<HydratedDocument<Comment> | null> {
        return CommentModel.findById(id);
    }

    async save(document: HydratedDocument<Comment>): Promise<string> {
        const savedComment = await document.save();

        return savedComment.id;
    }

    async updateLikesCount(commentId: string, likesModifier: number, dislikesModifier: number): Promise<boolean> {
        const result = await CommentModel.updateOne(
            { _id: commentId },
            {
                $inc: {
                    "likesInfo.likesCount": likesModifier,
                    "likesInfo.dislikesCount": dislikesModifier
                }
            }
        );

        return result.modifiedCount > 0;
    }

    async delete(commentId: string): Promise<boolean> {

        const deleteResult = await CommentModel.deleteOne({ _id: commentId });

        return deleteResult.deletedCount > 0;
    }

    async deleteAllByPostId(postId: string): Promise<boolean> {
        const deleteResult = await CommentModel.deleteMany({ postId: postId });

        return deleteResult.acknowledged;
    }
}