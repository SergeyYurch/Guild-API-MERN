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

export const commentsRouter = Router();

const {
    validateCommentInputModel,
    validateResult
} = validatorMiddleware;

export class CommentsController {
    private queryRepository: QueryRepository
    private usersService: UsersService
    private commentsService: CommentsService
    constructor() {
        this.queryRepository = new QueryRepository()
        this.usersService = new UsersService()
        this.commentsService = new CommentsService()
    }
    async getComment(req: Request, res: Response) {
        const id = req.params.commentId;
        console.log(`[commentsController]:GET - get comment by ID: ${id}`);
        const result = await this.queryRepository.getCommentById(id);
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
        const commentInDB = await this.queryRepository.getCommentById(id);
        if (!commentInDB) return res.sendStatus(404);
        if (commentInDB.userId !== userId) return res.sendStatus(403);
        const result = await this.commentsService.editComment(id, {content});
        console.log(`[commentsController]:PUT - edit comment by ID: ${id} result: ${result}`);
        return result ? res.sendStatus(204) : res.sendStatus(500);
    }

    async deleteComment(req: RequestWithId, res: Response) {
        const id = req.params.commentId;
        if (!ObjectId.isValid(id) || !await this.queryRepository.getCommentById(id)) return res.sendStatus(404);
        const userId = req.user!.id;
        if (!userId) return res.sendStatus(401);
        const userInDb = await this.usersService.getUserById(userId);
        if (!userInDb || userInDb.id !== userId) return res.sendStatus(401);
        const commentInDB = await this.queryRepository.getCommentById(id);
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

commentsRouter.delete('/:commentId',
    authBearerMiddleware,
    commentsController.deleteComment.bind(commentsController)
);

commentsRouter.get('/:commentId',
    commentsController.getComment.bind(commentsController)
);