import { injectable } from "inversify";
import { HydratedDocument } from "mongoose";
import { CommentLikeModel } from "../../../db/mongo.db";
import { CommentLike } from "../types/comment-like";

@injectable()
export class CommentLikeRepository {

    async findById(id: string): Promise<HydratedDocument<CommentLike> | null> {
        return CommentLikeModel.findById(id);
    }

    async findByCommentIdAndUserId(commentId: string, userId: string): Promise<HydratedDocument<CommentLike> | null> {
        return CommentLikeModel.findOne({ commentId, userId });
    }

    async save(dto: CommentLike): Promise<string> {

        const savedLike = await CommentLikeModel.findOneAndUpdate(
            {
                commentId: dto.commentId,
                userId: dto.userId
            },
            {
                status: dto.status,
                createdAt: dto.createdAt
            },
            {
                upsert: true,
                returnDocument: 'after',
            }
        );

        return savedLike.id;
    }

    async delete(commentId: string): Promise<boolean> {

        const deleteResult = await CommentLikeModel.deleteOne({ _id: commentId });

        return deleteResult.deletedCount > 0;
    }
}