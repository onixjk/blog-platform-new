import { Result } from "../../../core/result/result.type";
import { ResultStatus } from "../../../core/result/resultCode";
import { inject, injectable } from "inversify";
import { LikeRepository } from "../repositories/like.repository";
import { Like } from "../types/like";

@injectable()
export class LikeService {

    constructor(
        @inject(LikeRepository) private likeRepository: LikeRepository,
    ) {}

    async update(dto: Like): Promise<Result<string | null>> {

        const savedLike = await this.likeRepository.save(dto);

        return {
            status: ResultStatus.Success,
            data: savedLike,
            extensions: []
        };
    }
}