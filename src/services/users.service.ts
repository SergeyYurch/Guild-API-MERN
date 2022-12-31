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

export const usersService = {
    test (){
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!test!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    },
    async deleteUserById(id: string): Promise<boolean> {
        return await usersRepository.deleteUserById(id);
    },
    async findUserByEmailOrLogin(loginOrEmail: string): Promise<UserViewModelDto | null> {
        const result = await usersRepository.findUserByEmailOrLogin(loginOrEmail);
        if (!result) return null;
        return parseUserViewModel(result);
    },
    async getUserById(id: string): Promise<UserViewModelDto | null> {
        const result = await usersRepository.getUserById(id);
        if (!result) return null;
        return parseUserViewModel(result);
    },
    async createNewUser(login: string, email: string, password: string, confirmed?: boolean): Promise<UserViewModelDto | null> {
        console.log(this);
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
            }
        };
        const newUserId = await usersRepository.createNewUser(newUser);
        if (!newUserId) return null;
        const user = await usersRepository.getUserById(newUserId);
        if (!user) return null;
        if (confirmed) return parseUserViewModel(user);
        await emailManager.sendEmailConfirmation(user.accountData.email, user.emailConfirmation.confirmationCode);
        return parseUserViewModel(user);
    }
};
