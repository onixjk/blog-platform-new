import { injectable } from "inversify";
import { HydratedDocument } from "mongoose";
import { PostLikeModel } from "../../../db/mongo.db";
import { PostLike } from "../types/post-like";
import { LikeStatus } from "../types/like-status";

@injectable()
export class PostLikeRepository {

    async findByPostIdAndUserId(postId: string, userId: string): Promise<HydratedDocument<PostLike> | null> {
        return PostLikeModel.findOne({ postId, userId });
    }

    // async save(dto: PostLike): Promise<string> {
    //
    //     const savedLike = await PostLikeModel.findOneAndUpdate(
    //         {
    //             postId: dto.postId,
    //             userId: dto.userId
    //         },
    //         {
    //             status: dto.status,
    //             createdAt: dto.createdAt
    //         },
    //         {
    //             upsert: true,
    //             returnDocument: 'after',
    //         }
    //     );
    //
    //     return savedLike.id;
    // }

    async getLatestLikesForPost(postId: string): Promise<any[]> {
        return PostLikeModel.find({ postId: postId, status: LikeStatus.Like })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();
    }

    async updateLikeStatus(postId: string, userId: string, status: LikeStatus, login: string): Promise<void> {
        await PostLikeModel.findOneAndUpdate(
            { postId, userId },
            { status, login, createdAt: new Date() },
            { upsert: true }
        );
    }
}