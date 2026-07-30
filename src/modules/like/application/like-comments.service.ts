import { Result } from "../../../core/result/result.type";
import { ResultStatus } from "../../../core/result/resultCode";
import { inject, injectable } from "inversify";
import { LikeCommentsRepository } from "../repositories/like-comments.repository";
import { LikeComments } from "../types/comment-like";

@injectable()
export class LikeCommentsService {

    constructor(
        @inject(LikeCommentsRepository) private likeRepository: LikeCommentsRepository,
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