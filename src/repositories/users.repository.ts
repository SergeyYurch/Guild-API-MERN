import {usersCollection} from "../adapters/dbAdapters";
import {ObjectId, WithId} from "mongodb";
import {UserEntity} from "../services/entities/user.entity";
import {UsersRepositoryInterface} from "./interfaces/users.repository.interface";
import {UserInDbEntity} from "./entitiesRepository/user-in-db.entity";

const parseUserInDbEntity = (result: WithId<UserEntity>): UserInDbEntity => {
    console.log(' parseUserInDbEntity');
    return ({
        id: result._id.toString(),
        accountData: {
            login: result.accountData.login,
            email: result.accountData.email,
            passwordHash: result.accountData.passwordHash,
            passwordSalt: result.accountData.passwordSalt,
            createdAt: result.accountData.createdAt
        },
        emailConfirmation: {
            confirmationCode: result.emailConfirmation.confirmationCode,
            expirationDate: result.emailConfirmation.expirationDate,
            isConfirmed: result.emailConfirmation.isConfirmed,
            dateSendingConfirmEmail: result.emailConfirmation.dateSendingConfirmEmail
        }
    });
};

export const usersRepository: UsersRepositoryInterface = {
    async findUserByEmailOrLogin(loginOrEmail: string): Promise<UserInDbEntity | null> {
        console.log(`[findUserByEmailOrPassword]: loginOrEmail:${loginOrEmail}`);
        const result = await usersCollection.findOne({$or: [{'accountData.email': loginOrEmail}, {'accountData.login': loginOrEmail}]});
        if (!result) return null;
        return parseUserInDbEntity(result);
    },
    async findUserByConfirmationCode(value: string): Promise<UserInDbEntity | null> {
        console.log(`[usersRepository]: findUser by confirmationCode`);
        const result = await usersCollection.findOne({'emailConfirmation.confirmationCode': value});
        if (!result) return null;
        console.log(`[usersRepository]: findUser by confirmationCode - user find!`);
        return parseUserInDbEntity(result);
    },
    async createNewUser(user: UserEntity): Promise<string | null> {
        console.log(`[usersRepository]: createNewUser login: ${user.accountData.login}, e-mail: ${user.accountData.email}`);
        const result = await usersCollection.insertOne(user);
        if (result.acknowledged) return result.insertedId.toString();
        return null;
    },
    async deleteUserById(id: string): Promise<boolean> {
        const result = await usersCollection.deleteOne({_id: new ObjectId(id)});
        return result.acknowledged;
    },
    async getUserById(id: string): Promise<UserInDbEntity | null> {
        console.log(`[usersRepository]: getUserById ${id}`);
        const result = await usersCollection.findOne({_id: new ObjectId(id)});
        if (!result) return null;
        return parseUserInDbEntity(result);
    },
    async confirmEmailInDb(id: string): Promise<boolean> {
        const result = await usersCollection.updateOne(
            {_id: new ObjectId(id)},
            {
                $set: {
                    'emailConfirmation.isConfirmed': true,
                    'dateSendingConfirmEmail': []
                }
            });
        return result.acknowledged;
    },
    async updateSendingConfirmEmail(id: string, confirmationCode: string, expirationDate: Date): Promise<boolean> {
        const result = await usersCollection.updateOne(
            {_id: new ObjectId(id)},
            {
                $set: {
                    'emailConfirmation.confirmationCode': confirmationCode,
                    'emailConfirmation.expirationDate': expirationDate
                },
                $push: {'dateSendingConfirmEmail': new Date()}
            });
        return result.acknowledged;
    },
    async setNewConfirmationCode(id: string, code: string, date: Date): Promise<boolean> {
        const result = await usersCollection.updateOne(
            {_id: new ObjectId(id)},
            {
                $set: {
                    'emailConfirmation.confirmationCode': code,
                    'emailConfirmation.expirationDate': date
                },
            });
        return result.acknowledged;
    }
};