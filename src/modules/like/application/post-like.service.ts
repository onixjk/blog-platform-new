import { Result } from "../../../core/result/result.type";
import { ResultStatus } from "../../../core/result/resultCode";
import { inject, injectable } from "inversify";
import { PostLike } from "../types/like-posts";
import { PostLikeRepository } from "../repositories/post-like.repository";

@injectable()
export class PostLikeService {

    constructor(
        @inject(PostLikeRepository) private postLikeRepository: PostLikeRepository,
    ) {}

    async update(dto: PostLike): Promise<Result<string | null>> {

        const savedLike = await this.postLikeRepository.save(dto);

        return {
            status: ResultStatus.Success,
            data: savedLike,
            extensions: []
        };
    }
}