import {Request, Response} from "express";
import {
    RequestWithBody,
    RequestWithId
} from "../types/request.type";
import {QueryRepository} from "../repositories/query.repository";
import {PaginatorOptionInterface} from "../repositories/interfaces/query.repository.interface";
import {parseQueryPaginator} from "../helpers/helpers";
import {ObjectId} from "mongodb";
import {UsersService} from "../services/users.service";
import {UserInputModelDto} from "./dto/inputModels/userInputModel.dto";
import {injectable} from 'inversify';

@injectable()
export class UserController {

    constructor(
        protected usersService: UsersService,
        protected queryRepository: QueryRepository
    ) {
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
