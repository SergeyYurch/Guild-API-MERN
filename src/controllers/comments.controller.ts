import {Router, Request, Response} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {
    RequestWithId, RequestWithIdAndBody
} from "../types/request.type";
import {queryRepository} from "../repositories/query.repository";
import {ObjectId} from "mongodb";
import {authBearerMiddleware} from "../middlewares/authBearer.middleware";
import {commentsService} from "../services/comments.service";
import {CommentInputModelDto} from "./dto/commentInputModel.dto";
import {usersService} from "../services/users.service";

export const commentsRouter = Router();

const {
    validateCommentInputModel,
    validateResult
} = validatorMiddleware;
const {deleteCommentById, editComment} = commentsService;
const {getCommentById} = queryRepository;
const {getUserById} = usersService


commentsRouter.put('/:commentId',
    authBearerMiddleware,
    validateCommentInputModel(),
    validateResult,
    async (req: RequestWithIdAndBody<CommentInputModelDto>, res: Response) => {
        const id = req.params.commentId;
        console.log(`[commentsController]:PUT - edit comment by ID: ${id}`);
        const userId = req.user!.id;
        if (!userId) return res.sendStatus(401);
        const userInDb = await getUserById(userId);
        if (!userInDb || userInDb.id !== userId ) return res.sendStatus(401);
        if (!ObjectId.isValid(id)) return res.sendStatus(404);
        const {content} = req.body;
        const commentInDB = await getCommentById(id);
        if (!commentInDB) return res.sendStatus(404);
        if (commentInDB.userId !== userId) return res.sendStatus(403);
        const result = await editComment(id, {content});
        console.log(`[commentsController]:PUT - edit comment by ID: ${id} result: ${result}`);
        return result ? res.sendStatus(204) : res.sendStatus(500);
    });

commentsRouter.delete('/:commentId',
    authBearerMiddleware,
    async (req: RequestWithId, res: Response) => {
        const id = req.params.commentId;
        if (!ObjectId.isValid(id) || !await getCommentById(id)) return res.sendStatus(404);
        const userId = req.user!.id;
        if (!userId) return res.sendStatus(401);
        const userInDb = await getUserById(userId);
        if (!userInDb || userInDb.id!==userId) return res.sendStatus(401);
        const commentInDB = await getCommentById(id);
        if (!commentInDB) return res.sendStatus(404);
        if (commentInDB.userId !== userId) return res.sendStatus(403);
        const result = await deleteCommentById(id);
        return result ? res.sendStatus(204) : res.sendStatus(500);
    });

commentsRouter.get('/:commentId',
    async (req: Request, res: Response) => {
        const id = req.params.commentId;
        console.log(`[commentsController]:GET - get comment by ID: ${id}`);
        const result = await getCommentById(id);
        return result ? res.status(200).json(result) : res.sendStatus(404);
    });