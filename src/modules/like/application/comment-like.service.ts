import { Result } from "../../../core/result/result.type";
import { ResultStatus } from "../../../core/result/resultCode";
import { inject, injectable } from "inversify";
import { CommentLikeRepository } from "../repositories/comment-like.repository";
import { CommentLike } from "../types/comment-like";

@injectable()
export class CommentLikeService {

    constructor(
        @inject(CommentLikeRepository) private likeRepository: CommentLikeRepository,
    ) {}

    async update(dto: CommentLike): Promise<Result<string | null>> {

        const savedLike = await this.likeRepository.save(dto);

        return {
            status: ResultStatus.Success,
            data: savedLike,
            extensions: []
        };
    }
}