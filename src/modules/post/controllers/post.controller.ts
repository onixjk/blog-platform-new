import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { HttpStatuses } from "../../../core/types/http-statuses";
import { ResultStatus } from "../../../core/result/resultCode";
import { resultCodeToHttpException } from "../../../core/result/resultCodeToHttpException";
import { errorsHandler } from "../../../core/errors/errors.handler";
import PostService from "../application/postService";
import { PostQueryRepository } from "../repositories/post.query.repository";
import { PostInputDto } from "../types/input/post.input-dto";
import { CommentService } from "../../comment/application/comment.service";
import { CommentQueryRepository } from "../../comment/repositories/comment.query.repository";
import { CommentInputDto } from "../../comment/types/input/comment-input.dto";
import { matchedData } from "express-validator";
import { CommentQueryInput } from "../../comment/types/input/comment-query.input";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/helpers/set-default-sort-and-pagination";
import { PostQueryInput } from "../types/input/post-query.input";

@injectable()
export class PostController {

    constructor(
        @inject(PostQueryRepository) private postQueryRepository: PostQueryRepository,
        @inject(CommentQueryRepository) private commentQueryRepository: CommentQueryRepository,
        @inject(PostService) private postService: PostService,
        @inject(CommentService) private commentService: CommentService,
    ) {}

    async createPost(req: Request<{}, {}, PostInputDto>, res: Response) {
        try {
            const createdPostId = await this.postService.create(req.body);

            await this.postService.findByIdOrFail(createdPostId);

            const postOutput = await this.postQueryRepository.findById(createdPostId);

            res.status(HttpStatuses.Created_201).send(postOutput);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async createPostComment(req: Request<{ postId: string }, {}, CommentInputDto>, res: Response) {
        try {
            const { postId } = req.params;
            const userId = req.user.id!;

            const commentData = { ...req.body, userId, postId };
            const result = await this.commentService.create(commentData);

            if (result.status !== ResultStatus.Created_201) {
                return res
                    .status(resultCodeToHttpException(result.status))
                    .send(result.extensions);
            }

            const commentOutput = await this.commentQueryRepository.findById(result.data!);

            return res
                .status(resultCodeToHttpException(result.status))
                .send(commentOutput.data);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async deletePost(req: Request<{ id: string }>, res: Response) {
        try {
            const id = req.params.id;

            await this.postService.delete(id);

            res.sendStatus(HttpStatuses.NoContent_204);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async getPost(req: Request<{ id: string }>, res: Response) {
        try {
            const id = req.params.id;

            await this.postService.findByIdOrFail(id);

            const postOutput = await this.postQueryRepository.findById(id)

            res.status(HttpStatuses.Ok_200).send(postOutput);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async getPostCommentList(req: Request<{ postId: string }, {}, {}, {}>, res: Response) {
        try {
            const postId = req.params.postId;
            const postResult = await this.postService.findById(postId);

            if (postResult.status !== ResultStatus.Success_200) {
                return res
                    .status(resultCodeToHttpException(postResult.status))
                    .send(postResult.extensions);
            }

            const sanitizedQuery = matchedData<CommentQueryInput>(req, {
                locations: ['query'],
                includeOptionals: true,
            });

            const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

            const result = await this.commentQueryRepository.findCommentByPost(
                queryInput,
                postId,
            );

            if (result.status !== ResultStatus.Success_200) {
                return res
                    .status(resultCodeToHttpException(result.status))
                    .send(result.extensions);
            }

            return res
                .status(resultCodeToHttpException(result.status))
                .send(result.data);
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async getPostList(req: Request, res: Response,) {
        try {
            const sanitizedQuery = matchedData<PostQueryInput>(req, {
                locations: ['query'],
                includeOptionals: true,
            });

            const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

            const postsListOutput = await this.postQueryRepository.findMany(queryInput);

            res.status(HttpStatuses.Ok_200).send(postsListOutput)
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }

    async updatePost(req: Request<{ id: string }, {}, PostInputDto>, res: Response) {
        try {
            const id = req.params.id;

            await this.postService.update(id, req.body);

            res.sendStatus(HttpStatuses.NoContent_204)
        } catch (e: unknown) {
            errorsHandler(e, res);
        }
    }
}