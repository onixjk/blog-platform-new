import { Result } from "../../../core/result/result.type";
import { ResultStatus } from "../../../core/result/resultCode";
import { inject, injectable } from "inversify";
import { LikePosts } from "../types/like-posts";
import { LikePostsRepository } from "../repositories/like-posts.repository";

@injectable()
export class LikePostsService {

    constructor(
        @inject(LikePostsRepository) private postLikeRepository: LikePostsRepository,
    ) {}

    async update(dto: LikePosts): Promise<Result<string | null>> {

        const savedLike = await this.postLikeRepository.save(dto);

        return {
            status: ResultStatus.Success,
            data: savedLike,
            extensions: []
        };
    }
}