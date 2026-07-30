import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { HttpStatuses } from "../../../core/types/http-statuses";
import { ResultStatus } from "../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../core/result/resultCodeToHttpException";
import { PostService } from "../application/postService";
import { PostQueryRepository } from "../repositories/post.query.repository";
import { PostInputDto } from "../types/input/post.input-dto";
import { CommentService } from "../../comment/application/comment.service";
import { CommentQueryRepository } from "../../comment/repositories/comment.query.repository";
import { CommentInputDto } from "../../comment/types/input/comment-input.dto";
import { matchedData } from "express-validator";
import { CommentQueryInput } from "../../comment/types/input/comment-query.input";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-and-pagination";
import { PostQueryInput } from "../types/input/post-query.input";
import { LikeStatus } from "../../like/types/like-status";

@injectable()
export class PostController {

    constructor(
        @inject(PostService) private postService: PostService,
        @inject(CommentService) private commentService: CommentService,
        @inject(PostQueryRepository) private postQueryRepository: PostQueryRepository,
        @inject(CommentQueryRepository) private commentQueryRepository: CommentQueryRepository,
    ) {}

    async getPost(req: Request<{ id: string }>, res: Response) {

        const id = req.params.id;
        if (!id) return res.sendStatus(HttpStatuses.NotFound_404);

        const userId = req.user?.id;

        const postOutput = await this.postQueryRepository.findById(id, userId)
        if (!postOutput) return res.sendStatus(HttpStatuses.NotFound_404);

        res.status(HttpStatuses.Ok_200).send(postOutput);
    }

    async getPostCommentList(req: Request<{ postId: string }, {}, {}, {}>, res: Response) {

        const postId = req.params.postId;
        if (!postId) return res.sendStatus(HttpStatuses.NotFound_404);

        const userId = req.user?.id;

        const post = await this.postQueryRepository.findById(postId, userId);
        if (!post) return res.sendStatus(HttpStatuses.NotFound_404);

        const sanitizedQuery = matchedData<CommentQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });
        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const commentListOutput = await this.commentQueryRepository.findCommentByPost(
            queryInput,
            postId,
            userId,
        );

        res.status(HttpStatuses.Ok_200).send(commentListOutput);
    }

    async getPostList(req: Request, res: Response,) {

        const sanitizedQuery = matchedData<PostQueryInput>(req, {
            locations: ['query'],
            includeOptionals: true,
        });
        const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

        const userId = req.user?.id;

        const postsListOutput = await this.postQueryRepository.findMany(queryInput, userId);

        res.status(HttpStatuses.Ok_200).send(postsListOutput)
    }

    async createPost(req: Request<{}, {}, PostInputDto>, res: Response) {

        const createdPostId = await this.postService.create(req.body);
        if (createdPostId.status !== ResultStatus.Success || !createdPostId.data) {
            return res
                .status(resultCodeToHttpException(createdPostId.status))
                .send({ errorsMessages: createdPostId.extensions });
        }

        const postOutput = await this.postQueryRepository.findById(createdPostId.data);
        if (!postOutput) return res.sendStatus(HttpStatuses.BadRequest_400);

        res.status(HttpStatuses.Created_201).send(postOutput);
    }

    async createPostComment(req: Request<{ postId: string }, {}, CommentInputDto>, res: Response) {

        const { postId } = req.params;
        if (!postId) return res.sendStatus(HttpStatuses.NotFound_404);

        const userId = req.user.id;
        if (!userId) return res.sendStatus(HttpStatuses.Unauthorized_401);

        const commentData = { ...req.body, userId, postId };

        const createdCommentId = await this.commentService.create(commentData);
        if (createdCommentId.status !== ResultStatus.Success || !createdCommentId.data) {
            return res
                .status(resultCodeToHttpException(createdCommentId.status))
                .send({ errorsMessages: createdCommentId.extensions });
        }

        const commentOutput = await this.commentQueryRepository.findById(createdCommentId.data);
        if (!commentOutput) return res.sendStatus(HttpStatuses.BadRequest_400);

        return res.status(HttpStatuses.Created_201).send(commentOutput);
    }

    async updatePost(req: Request<{ id: string }, {}, PostInputDto>, res: Response) {

        const id = req.params.id;
        if (!id) return res.sendStatus(HttpStatuses.NotFound_404);

        const result = await this.postService.update(id, req.body);
        if (result.status !== ResultStatus.Success) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });
        }

        res.sendStatus(HttpStatuses.NoContent_204)
    }

    async updateLikeStatus(req: Request<{ postId: string }, {}, { likeStatus: LikeStatus }>, res: Response) {

        const postId = req.params.postId;
        if (!postId) return res.sendStatus(HttpStatuses.NotFound_404);

        const userId = req.user.id!;

        const likeStatus = req.body.likeStatus;
        if (!likeStatus) return res.sendStatus(HttpStatuses.BadRequest_400);

        const postData = { postId, userId, likeStatus }

        const result = await this.postService.updateLikeCountAndStatus(postData);
        if (result.status !== ResultStatus.Success) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });
        }

        return res.sendStatus(HttpStatuses.NoContent_204)
    }

    async deletePost(req: Request<{ id: string }>, res: Response) {

        const id = req.params.id;
        if (!id) return res.sendStatus(HttpStatuses.NotFound_404);

        const result = await this.postService.delete(id);
        if (result.status !== ResultStatus.Success || !result.data) {
            return res
                .status(resultCodeToHttpException(result.status))
                .send({ errorsMessages: result.extensions });
        }

        res.sendStatus(HttpStatuses.NoContent_204);
    }
}