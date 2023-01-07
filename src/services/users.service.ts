import {UserEntity} from "./entities/user.entity";
import {usersRepository} from "../repositories/users.repository";
import {UserViewModelDto} from "../controllers/dto/userViewModel.dto";
import {
    generatePassHash, generateHashSalt,
    getConfirmationCode,
    getConfirmationEmailExpirationDate,
    parseUserViewModel
} from "../helpers/helpers";
import {emailManager} from "../managers/emailManager";
import {queryRepository} from '../repositories/query.repository';
import {UserEntityWithIdInterface} from '../repositories/repository-interfaces/user-entity-with-id.interface';

export const usersService = {
    parseUserViewModel (user: UserEntityWithIdInterface): UserViewModelDto {
        return {
            id: user.id,
            login: user.accountData.login,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt.toISOString()
        };
    },
    async deleteUserById(id: string): Promise<boolean> {
        console.log(`[usersService]:deleteUserById started ...`);
        return await usersRepository.deleteUserById(id);
    },
    async findUserByEmailOrLogin(loginOrEmail: string): Promise<UserViewModelDto | null> {
        const result = await usersRepository.findUserByEmailOrLogin(loginOrEmail);
        if (!result) return null;
        return usersService.parseUserViewModel(result);
    },
    async getUserById(id: string): Promise<UserViewModelDto | null> {
        const result = await queryRepository.getUserById(id);
        if (!result) return null;
        return usersService.parseUserViewModel(result);
    },
    async createNewUser(login: string, email: string, password: string, confirmed?: boolean): Promise<UserViewModelDto | null> {
        console.log(`[usersService]: createNewUser ${login}`);
        const createdAt = new Date();
        const passwordSalt = await generateHashSalt();
        const passwordHash = generatePassHash(password, passwordSalt)
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
            passwordRecoveryInformation:null
        };
        const user = await usersRepository.createNewUser(newUser);
        if (!user) return null;
        if (confirmed) return parseUserViewModel(user);
        await emailManager.sendEmailConfirmation(user.accountData.email, user.emailConfirmation.confirmationCode);
        return usersService.parseUserViewModel(user);
    }
};