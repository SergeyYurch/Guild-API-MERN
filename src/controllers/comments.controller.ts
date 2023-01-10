import {Router, Request, Response} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {
    RequestWithId, RequestWithIdAndBody
} from "../types/request.type";
import {QueryRepository} from "../repositories/query.repository";
import {ObjectId} from "mongodb";
import {authBearerMiddleware} from "../middlewares/authBearer.middleware";
import {CommentsService} from "../services/comments.service";
import {CommentInputModelDto} from "./dto/commentInputModel.dto";
import {UsersService} from "../services/users.service";
import {authCheckBearerMiddleware} from '../middlewares/authCheckBearer.middleware';
import {QueryCommentsRepository} from '../repositories/queryComments.repository';
import {LikeInputModelDto} from './dto/likeInputModel.dto';

export const commentsRouter = Router();

const {
    validateCommentInputModel,
    validateLikeInputModel,
    validateResult
} = validatorMiddleware;

export class CommentsController {
    private queryRepository: QueryRepository;
    private usersService: UsersService;
    private commentsService: CommentsService;
    private queryCommentsRepository: QueryCommentsRepository;

    constructor() {
        this.queryRepository = new QueryRepository();
        this.queryCommentsRepository = new QueryCommentsRepository();
        this.usersService = new UsersService();
        this.commentsService = new CommentsService();
    }

    async getComment(req: Request, res: Response) {
        const id = req.params.commentId;
        const userId = req.user?.id || null;
        console.log(`[commentsController]:GET - get comment by ID: ${id}`);
        const result = await this.queryCommentsRepository.getCommentById(id, userId);
        return result ? res.status(200).json(result) : res.sendStatus(404);
    }

    async editComment(req: RequestWithIdAndBody<CommentInputModelDto>, res: Response) {
        const id = req.params.commentId;
        console.log(`[commentsController]:PUT - edit comment by ID: ${id}`);
        const userId = req.user!.id;
        if (!userId) return res.sendStatus(401);
        const userInDb = await this.usersService.getUserById(userId);
        if (!userInDb || userInDb.id !== userId) return res.sendStatus(401);
        if (!ObjectId.isValid(id)) return res.sendStatus(404);
        const {content} = req.body;
        const commentInDB = await this.queryCommentsRepository.getCommentById(id, userId);
        if (!commentInDB) return res.sendStatus(404);
        if (commentInDB.userId !== userId) return res.sendStatus(403);
        const result = await this.commentsService.editComment(id, {content});
        console.log(`[commentsController]:PUT - edit comment by ID: ${id} result: ${result}`);
        return result ? res.sendStatus(204) : res.sendStatus(500);
    }

    async changeLikeStatus(req: RequestWithIdAndBody<LikeInputModelDto>, res: Response) {
        console.log(`[commentsController]:PUT - changeLikeStatus by commentID`);
        const commentId = req.params.commentId;
        const user = req.user!;
        const {likeStatus} = req.body;
        if (!ObjectId.isValid(commentId)) return res.sendStatus(404);
        const commentInDB = await this.queryCommentsRepository.getCommentById(commentId, user.id);
        if (!commentInDB) return res.sendStatus(404);
        const result = await this.commentsService.changeLikeStatusComment(commentId, user.id, likeStatus);
        console.log(`[commentsController]:PUT - edit comment by ID: ${commentId} result: ${result}`);
        return result ? res.sendStatus(204) : res.sendStatus(500);
    }

    async deleteComment(req: RequestWithId, res: Response) {
        const id = req.params.commentId;
        const userId = req.user!.id;
        if (!ObjectId.isValid(id) || !await this.queryCommentsRepository.getCommentById(id, userId)) return res.sendStatus(404);
        if (!userId) return res.sendStatus(401);
        const userInDb = await this.usersService.getUserById(userId);
        if (!userInDb || userInDb.id !== userId) return res.sendStatus(401);
        const commentInDB = await this.queryCommentsRepository.getCommentById(id, userId);
        if (!commentInDB) return res.sendStatus(404);
        if (commentInDB.userId !== userId) return res.sendStatus(403);
        const result = await this.commentsService.deleteCommentById(id);
        return result ? res.sendStatus(204) : res.sendStatus(500);
    }
}

const commentsController = new CommentsController();

commentsRouter.put('/:commentId',
    authBearerMiddleware,
    validateCommentInputModel(),
    validateResult,
    commentsController.editComment.bind(commentsController)
);

commentsRouter.put('/:commentId/like-status',
    authBearerMiddleware,
    validateLikeInputModel(),
    validateResult,
    commentsController.changeLikeStatus.bind(commentsController)
);

commentsRouter.delete('/:commentId',
    authBearerMiddleware,
    commentsController.deleteComment.bind(commentsController)
);

commentsRouter.get('/:commentId',
    authCheckBearerMiddleware,
    commentsController.getComment.bind(commentsController)
);