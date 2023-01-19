import {Request, Response} from "express";
import {PostsService} from "../services/posts.service";
import {PostInputModelDto} from "./dto/inputModels/postInputModel.dto";
import {
    RequestWithBody, RequestWithId,
    RequestWithIdAndBody
} from "../types/request.type";
import {QueryRepository} from "../repositories/query.repository";
import {PaginatorOptionInterface} from "../repositories/interfaces/query.repository.interface";
import {parseQueryPaginator} from "../helpers/helpers";
import {CommentInputModelDto} from "./dto/inputModels/commentInputModel.dto";
import {CommentsService} from "../services/comments.service";
import {ObjectId} from "mongodb";
import {UsersService} from "../services/users.service";
import {QueryCommentsRepository} from '../repositories/queryComments.repository';
import {injectable} from 'inversify';
import {LikeInputModelDto} from './dto/inputModels/likeInputModel.dto';
import {LikeStatusType} from '../repositories/interfaces/likeStatus.type';

@injectable()
export class PostsController {

    constructor(
        protected queryRepository: QueryRepository,
        protected queryCommentsRepository: QueryCommentsRepository,
        protected usersService: UsersService,
        protected commentsService: CommentsService,
        protected postsService: PostsService
    ) {
    }

    async getPosts(req: Request, res: Response) {
        const userId = req.user?.id || null;
        const paginatorOption: PaginatorOptionInterface = parseQueryPaginator(req);
        const posts = await this.queryRepository.getAllPosts(paginatorOption, userId);
        return res.status(200).json(posts);
    }

    async getPost(req: RequestWithId, res: Response) {
        const postId = req.params.id;
        const userId = req.user?.id || null;
        if (!ObjectId.isValid(postId)) return res.sendStatus(404);
        const result = await this.queryRepository.getPostById(postId, userId);
        return result ? res.status(200).json(result) : res.sendStatus(404);
    }

    async createPost(req: RequestWithBody<PostInputModelDto>, res: Response) {
        const {title, shortDescription, content, blogId} = req.body;
        const createdPost = await this.postsService.createNewPost({title, shortDescription, content, blogId});
        return createdPost ? res.status(201).json(createdPost) : res.sendStatus(500);
    }

    async editPost(req: RequestWithIdAndBody<PostInputModelDto>, res: Response) {
        const id = req.params.id;
        if (!ObjectId.isValid(id) || !(await this.queryRepository.getPostById(id, null))) return res.sendStatus(404);
        const body = req.body;
        const post: PostInputModelDto = {
            title: body.title,
            blogId: body.blogId,
            content: body.content,
            shortDescription: body.shortDescription
        };
        const result = await this.postsService.editPostById(id, post);
        return result ? res.sendStatus(204) : res.sendStatus(404);
    }

    async deletePost(req: RequestWithId, res: Response) {
        const id = req.params.id;
        if (!ObjectId.isValid(id) || !(await this.queryRepository.getPostById(id, null))) return res.sendStatus(404);
        const result = await this.postsService.deletePostById(id);
        return result ? res.sendStatus(204) : res.sendStatus(500);
    }

    async createCommentForPost(req: RequestWithIdAndBody<CommentInputModelDto>, res: Response) {
        console.log(`[postController]:createCommentForPost `);
        const postId = req.params.postId;
        const userId = req.user!.id;
        if (!userId) return res.sendStatus(401);
        const userInDb = this.usersService.getUserById(userId);
        if (!userInDb) return res.sendStatus(401);
        console.log(`[postsController]: created new comment for post id:${postId} from user id:${userId}`);
        if (!ObjectId.isValid(postId) || !(await this.queryRepository.getPostById(postId, null))) {
            console.log(`[postsController]: wrong post id:${postId}`);
            return res.sendStatus(404);
        }
        const {content} = req.body;
        const createdComment = await this.commentsService.createUserComment(content, userId, postId);
        return createdComment ? res.status(201).send(createdComment) : res.sendStatus(500);
    }

    async getCommentsForPost(req: RequestWithIdAndBody<CommentInputModelDto>, res: Response) {
        const userId = req.user?.id || null;
        const postId = req.params.postId;
        if (!ObjectId.isValid(postId) || !(await this.queryRepository.getPostById(postId, userId))) return res.sendStatus(404);
        const paginatorOption: PaginatorOptionInterface = parseQueryPaginator(req);
        const result = await this.queryCommentsRepository.findAllCommentsByPostId(userId, postId, paginatorOption);
        return result ? res.status(200).json(result) : res.sendStatus(500);
    }

    async editPostLikeStatus(req: RequestWithIdAndBody<LikeInputModelDto>, res: Response) {
        const postId = req.params.postId;
        const userId = req.user!.id
        if (!ObjectId.isValid(postId) || !(await this.queryRepository.getPostById(postId, null))) return res.sendStatus(404);
        const body = req.body;
        const likeStatus: LikeStatusType = body.likeStatus
        const result = await this.postsService.changePostsLikeStatus(postId, userId,likeStatus);
        return result ? res.sendStatus(204) : res.sendStatus(500);
    }
}
