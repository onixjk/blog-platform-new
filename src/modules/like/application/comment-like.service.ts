import { Result } from "../../../core/result/result.type";
import { ResultStatus } from "../../../core/result/resultCode";
import { inject, injectable } from "inversify";
import { CommentLikeRepository } from "../repositories/comment-like.repository";
import { LikeComments } from "../types/like-comments";

@injectable()
export class CommentLikeService {

    constructor(
        @inject(CommentLikeRepository) private likeRepository: CommentLikeRepository,
    ) {}

    async update(dto: LikeComments): Promise<Result<string | null>> {

        const savedLike = await this.likeRepository.save(dto);

        return {
            status: ResultStatus.Success,
            data: savedLike,
            extensions: []
        };
    }
}