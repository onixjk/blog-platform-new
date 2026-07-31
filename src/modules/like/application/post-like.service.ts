import { Result } from "../../../core/result/result.type";
import { ResultStatus } from "../../../core/result/resultCode";
import { inject, injectable } from "inversify";
import { PostLikeRepository } from "../repositories/post-like.repository";
import { PostLike } from "../types/post-like";

@injectable()
export class PostLikeService {

    constructor(
        @inject(PostLikeRepository) private postLikeRepository: PostLikeRepository,
    ) {}

    // async update(dto: PostLike): Promise<Result<string | null>> {
    //
    //     const savedLike = await this.postLikeRepository.save(dto);
    //
    //     return {
    //         status: ResultStatus.Success,
    //         data: savedLike,
    //         extensions: []
    //     };
    // }
}