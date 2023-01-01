import {UserEntity} from "../../services/entities/user.entity";
import {UserEntityWithIdInterface} from "../repository-interfaces/user-entity-with-id.interface";

export interface UsersRepositoryInterface {
    findUserByEmailOrLogin: (loginOrEmail: string) => Promise<UserEntityWithIdInterface | null>;
    createNewUser: (user: UserEntity) => Promise<string | null>;
    deleteUserById: (id: string) => Promise<boolean>;
    getUserById: (id: string) => Promise<UserEntityWithIdInterface | null>;
    findUserByConfirmationCode: (value: string) => Promise<UserEntityWithIdInterface | null>;
    confirmEmailInDb: (id: string) => Promise<boolean>;
    updateSendingConfirmEmail: (id: string, confirmationCode: string, expirationDate: Date) => Promise<boolean>;
    setNewConfirmationCode: (id: string, code: string, date: Date) => Promise<boolean>;
}