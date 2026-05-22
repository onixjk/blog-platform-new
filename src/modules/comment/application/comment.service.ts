import {WithId} from "mongodb";
import {CommentCreateDto} from "../routers/input/comment-create.dto";
import {Comment} from "../types/comment";
import {commentRepository} from "../repositories/comment.repository";
import {usersService} from "../../user/application/usersService";
import {postsService} from "../../post/application/posts.service";
import {CommentInputDto} from "../routers/input/comment-input.dto";
import {CommentUpdateDto} from "../routers/input/comment-update.dto";

export const commentService = {

    async findByIdOrFail(id: string): Promise<WithId<Comment>> {
        return commentRepository.findByIdOrFail(id);
    },

    async create(dto: CommentCreateDto): Promise<string> {

        await postsService.findByIdOrFail(dto.postId);

        const user = await usersService.findByIdOrFail(dto.userId);

        const newComment: Comment = {
            postId: dto.postId,
            content: dto.content,
            commentatorInfo: {
                userId: dto.userId,
                userLogin: user.login
            },
            createdAt: new Date().toISOString(),
        }

        return commentRepository.create(newComment);
    },

    async update(dto: CommentUpdateDto): Promise<void> {
        await commentRepository.update(dto);
        return;
    },

    async delete(id: string, userId: string): Promise<void> {
        await commentRepository.delete(id, userId);
        return;
    },

    async deleteAllByPostId(postId: string): Promise<void> {
        await commentRepository.deleteAllByPostId(postId);
        return;
    }
}