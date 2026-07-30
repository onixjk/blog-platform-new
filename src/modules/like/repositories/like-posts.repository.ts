import { injectable } from "inversify";
import { HydratedDocument } from "mongoose";
import { LikePostsModel } from "../../../db/mongo.db";
import { LikePosts } from "../types/like-posts";

@injectable()
export class LikePostsRepository {

    async findById(id: string): Promise<HydratedDocument<LikePosts> | null> {
        return LikePostsModel.findById(id);
    }

    async findByPostIdAndUserId(postId: string, userId: string): Promise<HydratedDocument<LikePosts> | null> {
        return LikePostsModel.findOne({ postId, userId });
    }

    async save(dto: LikePosts): Promise<string> {

        const savedLike = await LikePostsModel.findOneAndUpdate(
            {
                commentId: dto.postId,
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

    async delete(postId: string): Promise<boolean> {

        const deleteResult = await LikePostsModel.deleteOne({ _id: postId });

        return deleteResult.deletedCount > 0;
    }
}