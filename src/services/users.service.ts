import {UserEntity} from "./entities/user.entity";
import {UsersRepository} from "../repositories/users.repository";
import {UserViewModelDto} from "../controllers/dto/viewModels/userViewModel.dto";
import {
    generatePassHash, generateHashSalt,
    getConfirmationCode,
    getConfirmationEmailExpirationDate,
    parseUserViewModel
} from "../helpers/helpers";
import {emailManager} from "../managers/emailManager";
import {UserEntityWithIdInterface} from '../repositories/repository-interfaces/user-entity-with-id.interface';
import {QueryRepository} from '../repositories/query.repository';

export class UsersService {
    private usersRepository: UsersRepository;
    private queryRepository: QueryRepository;

    constructor() {
        this.usersRepository = new UsersRepository();
        this.queryRepository = new QueryRepository();
    }

    parseUserViewModel(user: UserEntityWithIdInterface): UserViewModelDto {
        return {
            id: user.id,
            login: user.accountData.login,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt.toISOString()
        };
    }

    async deleteUserById(id: string): Promise<boolean> {
        console.log(`[usersService]:deleteUserById started ...`);
        return await this.usersRepository.deleteUserById(id);
    }

    async findUserByEmailOrLogin(loginOrEmail: string): Promise<UserViewModelDto | null> {
        const result = await this.usersRepository.findUserByEmailOrLogin(loginOrEmail);
        if (!result) return null;
        return this.parseUserViewModel(result);
    }

    async getUserById(id: string): Promise<UserViewModelDto | null> {
        const result = await this.queryRepository.getUserById(id);
        if (!result) return null;
        return this.parseUserViewModel(result);
    }

    async createNewUser(login: string, email: string, password: string, confirmed?: boolean): Promise<UserViewModelDto | null> {
        console.log(`[usersService]: createNewUser ${login}`);
        const createdAt = new Date();
        const passwordSalt = await generateHashSalt();
        const passwordHash = generatePassHash(password, passwordSalt);
        const newUser: UserEntity = {
            accountData: {
                login,
                email,
                passwordHash,
                passwordSalt,
                createdAt
            },
            emailConfirmation: {
                confirmationCode: getConfirmationCode(),
                expirationDate: getConfirmationEmailExpirationDate(),
                isConfirmed: !!confirmed,
                dateSendingConfirmEmail: [new Date()]
            },
            passwordRecoveryInformation: null
        };
        const user = await this.usersRepository.createNewUser(newUser);
        if (!user) return null;
        if (confirmed) return parseUserViewModel(user);
        await emailManager.sendEmailConfirmation(user.accountData.email, user.emailConfirmation.confirmationCode);
        return this.parseUserViewModel(user);
    }
}

