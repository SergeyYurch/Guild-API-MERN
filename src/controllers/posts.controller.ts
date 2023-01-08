import {Router, Request, Response} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {PostsService} from "../services/posts.service";
import {PostInputModelDto} from "./dto/postInputModel.dto";
import {
    RequestWithBody, RequestWithId,
    RequestWithIdAndBody
} from "../types/request.type";
import {QueryRepository} from "../repositories/query.repository";
import {PaginatorOptionInterface} from "../repositories/interfaces/query.repository.interface";
import {parseQueryPaginator} from "../helpers/helpers";
import {authBasicMiddleware} from "../middlewares/authBasic.middleware";
import {authBearerMiddleware} from "../middlewares/authBearer.middleware";
import {CommentInputModelDto} from "./dto/commentInputModel.dto";
import {CommentsService} from "../services/comments.service";
import {ObjectId} from "mongodb";
import {UsersService} from "../services/users.service";

export const postsRouter = Router();
const {
    validatePostInputModel,
    validateResult,
    validateBlogId,
    validateCommentInputModel
} = validatorMiddleware;


export class PostsController {
    private queryRepository: QueryRepository;
    private usersService: UsersService;
    private commentsService: CommentsService;
    private postsService:PostsService

    constructor() {
        this.queryRepository = new QueryRepository();
        this.usersService = new UsersService();
        this.commentsService = new CommentsService();
        this.postsService = new PostsService()
    }

    async getPosts(req: Request, res: Response) {
        const paginatorOption: PaginatorOptionInterface = parseQueryPaginator(req);
        const posts = await this.queryRepository.getAllPosts(paginatorOption);
        return res.status(200).json(posts);
    }

    async getPost(req: RequestWithId, res: Response) {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.sendStatus(404);
        const result = await this.queryRepository.getPostById(id);
        return result ? res.status(200).json(result) : res.sendStatus(404);
    }

    async createPost(req: RequestWithBody<PostInputModelDto>, res: Response) {
        const {title, shortDescription, content, blogId} = req.body;
        const createdPost = await this.postsService.createNewPost({title, shortDescription, content, blogId});
        return createdPost ? res.status(201).json(createdPost) : res.sendStatus(500);
    }

    async editPost(req: RequestWithIdAndBody<PostInputModelDto>, res: Response) {
        const id = req.params.id;
        if (!ObjectId.isValid(id) || !(await this.queryRepository.getPostById(id))) return res.sendStatus(404);
        const body = req.body;
        const post: PostInputModelDto = {
            title: body.title,
            blogId: body.blogId,
            content: body.content,
            shortDescription: body.shortDescription
        };
        const result =  await this.postsService.editPostById(id, post);
        return result ? res.sendStatus(204) : res.sendStatus(404);
    }

    async deletePost(req: RequestWithId, res: Response) {
        const id = req.params.id;
        if (!ObjectId.isValid(id) || !(await this.queryRepository.getPostById(id))) return res.sendStatus(404);
        const result = await this.postsService.deletePostById(id);
        return result ? res.sendStatus(204) : res.sendStatus(500);
    }

    async createCommentForPost(req: RequestWithIdAndBody<CommentInputModelDto>, res: Response) {
        const postId = req.params.postId;
        const userId = req.user!.id;
        if (!userId) return res.sendStatus(401);
        const userInDb = this.usersService.getUserById(userId);
        if (!userInDb) return res.sendStatus(401);
        console.log(`[postsController]: created new comment for post id:${postId} from user id:${userId}`);
        if (!ObjectId.isValid(postId) || !(await this.queryRepository.getPostById(postId))) {
            console.log(`[postsController]: wrong post id:${postId}`);
            return res.sendStatus(404);
        }
        const {content} = req.body;
        const createdComment = await this.commentsService.createUserComment(content, userId, postId);
        return createdComment ? res.status(201).send(createdComment) : res.sendStatus(500);
    }

    async getCommentsFOrPost(req: RequestWithIdAndBody<CommentInputModelDto>, res: Response) {
        const postId = req.params.postId;
        if (!ObjectId.isValid(postId) || !(await this.queryRepository.getPostById(postId))) return res.sendStatus(404);
        const paginatorOption: PaginatorOptionInterface = parseQueryPaginator(req);
        const result = await this.queryRepository.findAllCommentsByPostId(postId, paginatorOption);
        return result ? res.status(200).json(result) : res.sendStatus(500);
    }
}

const postsController = new PostsController;

postsRouter.get('/', postsController.getPosts.bind(postsController));

postsRouter.post(
    '/',
    authBasicMiddleware,
    validatePostInputModel(),
    validateBlogId(),
    validateResult,
    postsController.createPost.bind(postsController)
);

postsRouter.get('/:id',
    postsController.getPost.bind(postsController));

postsRouter.put(
    '/:id',
    authBasicMiddleware,
    validatePostInputModel(),
    validateBlogId(),
    validateResult,
    postsController.editPost.bind(postsController)
);

postsRouter.delete('/:id',
    authBasicMiddleware,
    postsController.deletePost.bind(postsController)
);

postsRouter.post(
    '/:postId/comments',
    authBearerMiddleware,
    validateCommentInputModel(),
    validateResult,
    postsController.createCommentForPost.bind(postsController)
);

postsRouter.get('/:postId/comments',
    postsController.getCommentsFOrPost.bind(postsController)
);