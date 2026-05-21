import {WithId} from "mongodb";
import {CommentInputDto} from "../routers/input/comment.input-dto";
import {Comment} from "../types/comment";
import {commentRepository} from "../repositories/comment.repository";

export const commentService = {

    async findByIdOrFail(id: string): Promise<WithId<Comment>> {
        return commentRepository.findByIdOrFail(id);
    },

    async create(dto: CommentInputDto): Promise<string> {
        // const post = await postsService.findByIdOrFail(dto.postId);

        const newComment: Comment = {
            content: dto.content,
            commentatorInfo: {userId: "1", userLogin: "Login"},  //todo
            createdAt: new Date().toISOString(),
        }

        return commentRepository.create(newComment);
    },

    async update(id: string, dto: CommentInputDto): Promise<void> {
        // const post = await postsService.findByIdOrFail(dto.postId);

        await commentRepository.update(id, dto);
        return;
    },

    async delete(id: string): Promise<void> {
        await commentRepository.delete(id);
        return;
    },

    // async deleteAllByPostId(postId: string): Promise<void> {
    //     await commentRepository.deleteAllByPostId(postId);
    //     return;
    // }
}