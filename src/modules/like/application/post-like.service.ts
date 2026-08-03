import { inject, injectable } from "inversify";
import { PostLikeRepository } from "../repositories/post-like.repository";

@injectable()
export class PostLikeService {

    constructor(
        @inject(PostLikeRepository) private postLikeRepository: PostLikeRepository,
    ) {}


}