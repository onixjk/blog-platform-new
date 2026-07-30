import { injectable } from "inversify";
import { HydratedDocument } from "mongoose";
import { PostLikeModel } from "../../../db/mongo.db";
import { PostLike } from "../types/post-like";

@injectable()
export class PostLikeRepository {

    async findById(id: string): Promise<HydratedDocument<PostLike> | null> {
        return PostLikeModel.findById(id);
    }

    async findByPostIdAndUserId(postId: string, userId: string): Promise<HydratedDocument<PostLike> | null> {
        return PostLikeModel.findOne({ postId, userId });
    }

    async save(dto: PostLike): Promise<string> {

        const savedLike = await PostLikeModel.findOneAndUpdate(
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

        const deleteResult = await PostLikeModel.deleteOne({ _id: postId });

        return deleteResult.deletedCount > 0;
    }
}