import { injectable } from "inversify";
import { HydratedDocument } from "mongoose";
import { LikeModel } from "../../../db/mongo.db";
import { Like } from "../types/like";

@injectable()
export class LikeRepository {

    async findById(id: string): Promise<HydratedDocument<Like> | null> {
        return LikeModel.findById(id);
    }

    async findByCommentIdAndUserId(commentId: string, userId: string): Promise<HydratedDocument<Like> | null> {
        return LikeModel.findOne({ commentId, userId });
    }

    async save(dto: Like): Promise<string> {

        const savedComment = await LikeModel.findOneAndUpdate(
            {
                commentId: dto.commentId,
                userId: dto.userId
            },
            {
                status: dto.status,
                createdAt: new Date().toISOString()
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        return savedComment.id;
    }

    async delete(commentId: string): Promise<boolean> {

        const deleteResult = await LikeModel.deleteOne({ _id: commentId });

        return deleteResult.deletedCount > 0;
    }
}