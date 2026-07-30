import { injectable } from "inversify";
import { HydratedDocument } from "mongoose";
import { LikeCommentsModel } from "../../../db/mongo.db";
import { LikeComments } from "../types/like-comments";

@injectable()
export class LikeCommentsRepository {

    async findById(id: string): Promise<HydratedDocument<LikeComments> | null> {
        return LikeCommentsModel.findById(id);
    }

    async findByCommentIdAndUserId(commentId: string, userId: string): Promise<HydratedDocument<LikeComments> | null> {
        return LikeCommentsModel.findOne({ commentId, userId });
    }

    async save(dto: LikeComments): Promise<string> {

        const savedLike = await LikeCommentsModel.findOneAndUpdate(
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

        const deleteResult = await LikeCommentsModel.deleteOne({ _id: commentId });

        return deleteResult.deletedCount > 0;
    }
}