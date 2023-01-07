import {Router, Request, Response} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {
    RequestWithBody,
    RequestWithId
} from "../types/request.type";
import {queryRepository} from "../repositories/query.repository";
import {PaginatorOptionInterface} from "../repositories/interfaces/query.repository.interface";
import {parseQueryPaginator} from "../helpers/helpers";
import {ObjectId} from "mongodb";
import {usersService} from "../services/users.service";
import {UserInputModelDto} from "./dto/userInputModel.dto";
import {authBasicMiddleware} from "../middlewares/authBasic.middleware";

export const usersRouter = Router();

const {
    validateUserInputModel,
    validateResult
} = validatorMiddleware;
const {createNewUser, deleteUserById, findUserByEmailOrLogin, getUserById} = usersService;
const {getAllUsers} = queryRepository;


usersRouter.get('/:id',
    async (req: RequestWithId, res: Response) => {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.sendStatus(404);
        const user = await getUserById(id);
        if (!user) return res.sendStatus(404);
        return res.status(204).send(user);
    });


usersRouter.post('/',
    authBasicMiddleware,
    validateUserInputModel(),
    validateResult,
    async (req: RequestWithBody<UserInputModelDto>, res: Response) => {
        const {login, password, email} = req.body;
        if (await findUserByEmailOrLogin(login)
            || await findUserByEmailOrLogin(email)) return res.sendStatus(400);
        const result = await createNewUser(login, email, password, true);
        return result ? res.status(201).json(result) : res.sendStatus(500);
    });


usersRouter.get('/',
    authBasicMiddleware,
    async (req: Request, res: Response) => {
        console.log(`[userController]: GET https//{host}/users  init...`);
        const searchLoginTerm: string | null = req.query.searchLoginTerm ? String(req.query.searchLoginTerm) : null;
        const searchEmailTerm: string | null = req.query.searchEmailTerm ? String(req.query.searchEmailTerm) : null;
        const paginatorOption: PaginatorOptionInterface = parseQueryPaginator(req);
        console.log(searchLoginTerm);
        const result = await getAllUsers(paginatorOption, searchLoginTerm, searchEmailTerm);
        return res.status(200).json(result);
    });

usersRouter.delete('/:id',
    authBasicMiddleware,
    async (req: RequestWithId, res: Response) => {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.sendStatus(404);
        const isExistUser = await getUserById(id);
        if (!isExistUser) return res.sendStatus(404);
        const result = await deleteUserById(id);
        return result ? res.sendStatus(204) : res.sendStatus(401);
    });
