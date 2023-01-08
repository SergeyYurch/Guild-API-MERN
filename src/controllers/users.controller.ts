import {Router, Request, Response} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {
    RequestWithBody,
    RequestWithId
} from "../types/request.type";
import {QueryRepository} from "../repositories/query.repository";
import {PaginatorOptionInterface} from "../repositories/interfaces/query.repository.interface";
import {parseQueryPaginator} from "../helpers/helpers";
import {ObjectId} from "mongodb";
import {UsersService} from "../services/users.service";
import {UserInputModelDto} from "./dto/userInputModel.dto";
import {authBasicMiddleware} from "../middlewares/authBasic.middleware";

export const usersRouter = Router();

const {
    validateUserInputModel,
    validateResult
} = validatorMiddleware;

// const {createNewUser, deleteUserById, findUserByEmailOrLogin, getUserById} = usersService;


export class UserController {
    private usersService: UsersService;
    private queryRepository: QueryRepository;

    constructor() {
        this.usersService = new UsersService();
        this.queryRepository = new QueryRepository();
    }

    async getUser(req: RequestWithId, res: Response) {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.sendStatus(404);
        const user = await this.usersService.getUserById(id);
        if (!user) return res.sendStatus(404);
        return res.status(204).send(user);
    }

    async createUser(req: RequestWithBody<UserInputModelDto>, res: Response) {
        const {login, password, email} = req.body;
        if (await this.usersService.findUserByEmailOrLogin(login)) return res.sendStatus(400);
        if (await this.usersService.findUserByEmailOrLogin(email)) return res.sendStatus(400);
        const result = await this.usersService.createNewUser(login, email, password, true);
        return result ? res.status(201).json(result) : res.sendStatus(500);
    }

    async getUsers(req: Request, res: Response) {
        console.log(`[userController]: GET https//{host}/users  init...`);
        const searchLoginTerm: string | null = req.query.searchLoginTerm ? String(req.query.searchLoginTerm) : null;
        const searchEmailTerm: string | null = req.query.searchEmailTerm ? String(req.query.searchEmailTerm) : null;
        const paginatorOption: PaginatorOptionInterface = parseQueryPaginator(req);
        const result = await this.queryRepository.getAllUsers(paginatorOption, searchLoginTerm, searchEmailTerm);
        return res.status(200).json(result);
    }

    async deleteUser(req: RequestWithId, res: Response) {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) return res.sendStatus(404);
        const isExistUser = await this.usersService.getUserById(id);
        if (!isExistUser) return res.sendStatus(404);
        const result = await this.usersService.deleteUserById(id);
        return result ? res.sendStatus(204) : res.sendStatus(401);
    }
}

const userController = new UserController();

usersRouter.get('/:id',
    userController.getUser.bind(userController));

usersRouter.post('/',
    authBasicMiddleware,
    validateUserInputModel(),
    validateResult,
    userController.createUser.bind(userController));

usersRouter.get('/',
    authBasicMiddleware,
    userController.getUsers.bind(userController));

usersRouter.delete('/:id',
    authBasicMiddleware,
    userController.deleteUser.bind(userController));