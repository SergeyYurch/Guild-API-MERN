import {UserModel} from "../adapters/dbAdapters";
import {ObjectId, WithId} from "mongodb";
import {UserEntity} from "../services/entities/user.entity";
import {UserEntityWithIdInterface} from "./repository-interfaces/user-entity-with-id.interface";

export const usersRepository = {
    parseUserInDbEntity(result: WithId<UserEntity>): UserEntityWithIdInterface {
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
            },
            passwordRecoveryInformation: result.passwordRecoveryInformation
                ? {
                    recoveryCode: result.passwordRecoveryInformation.recoveryCode,
                    expirationDate: result.passwordRecoveryInformation.expirationDate
                }
                : null
        });
    },

    async findUserByEmailOrLogin(loginOrEmail: string): Promise<UserEntityWithIdInterface | null> {
        console.log(`[userRepository]:findUserByEmailOrLogin:${loginOrEmail}`);
        const result = await UserModel.findOne({$or: [{'accountData.email': loginOrEmail}, {'accountData.login': loginOrEmail}]});
        if (!result) return null;
        return this.parseUserInDbEntity(result);
    },
    async findUserByConfirmationCode(value: string): Promise<UserEntityWithIdInterface | null> {
        console.log(`[usersRepository]: findUser by confirmationCode`);
        const result = await UserModel.findOne({'emailConfirmation.confirmationCode': value});
        if (!result) return null;
        console.log(`[usersRepository]: findUser by confirmationCode - user find!`);
        return this.parseUserInDbEntity(result);
    },
    async findUserByPasswordRecoveryCode(value: string): Promise<UserEntityWithIdInterface | null> {
        console.log(`[usersRepository]: findUserByPasswordRecoveryCode starts...`);
        const result = await UserModel.findOne({'passwordRecoveryInformation.recoveryCode': value});
        if (!result) return null;
        return this.parseUserInDbEntity(result);
    },
    async createNewUser(user: UserEntity): Promise<UserEntityWithIdInterface | null> {
        console.log(`[usersRepository]: createNewUser login: ${user.accountData.login}, e-mail: ${user.accountData.email}`);
        const userInstance = new UserModel(user);
        const result = await userInstance.save();
        if (!result) return null;
        return this.parseUserInDbEntity(result);
    },
    async deleteUserById(id: string): Promise<boolean> {
        console.log(`[usersRepository]: deleteUserById: ${id}`);
        const result = await UserModel.deleteOne({_id: new ObjectId(id)});
        return result.acknowledged;
    },

    async confirmEmailInDb(id: string): Promise<boolean> {
        console.log(`[usersRepository]: confirmEmailInDb: ${id}`);
        const user = await UserModel.findOne({_id: new ObjectId(id)});
        if (!user) return false;
        user.emailConfirmation.isConfirmed = true;
        user.emailConfirmation.dateSendingConfirmEmail = [];
        let result = true;
        user.save((err, doc) => result = !err);
        return result;

    },
    async updateSendingConfirmEmail(id: string, confirmationCode: string, expirationDate: Date): Promise<boolean> {
        console.log(`[usersRepository]: updateSendingConfirmEmail userId: ${id}`);
        const user = await UserModel.findOne({_id: new ObjectId(id)});
        if (!user) return false;
        user.emailConfirmation.confirmationCode = confirmationCode;
        user.emailConfirmation.expirationDate = expirationDate;
        user.emailConfirmation.dateSendingConfirmEmail.push(new Date());
        let result = true;
        user.save((err, doc) => result = !err);
        return result;

    },
    async saveSendingRecoveryPasswordEmail(id: string, recoveryCode: string, expirationDate: Date): Promise<boolean> {
        console.log(`[usersRepository]: saveSendingRecoveryPasswordEmail userId: ${id}`);
        const user = await UserModel.findOne({_id: new ObjectId(id)});
        if (!user) return false;
        user.passwordRecoveryInformation = {recoveryCode, expirationDate};
        let result = true;
        await user.save((err, doc) => result = !err);
        return result;
    },
    async confirmRecoveryPassword(id: string, passwordHash: string): Promise<boolean> {
        console.log(`[usersRepository]: confirmRecoveryPasswordEmail userId: ${id}`);
        const user = await UserModel.findOne({_id: new ObjectId(id)});
        if (!user) return false;
        user.accountData.passwordHash = passwordHash;
        user.passwordRecoveryInformation = null;
        let result = true;
        await user.save((err, doc) => result = !err);
        console.log(`[usersRepository]: confirmRecoveryPasswordEmail result: ${result}`);
        return result;
    },
    async setNewConfirmationCode(id: string, code: string, date: Date): Promise<boolean> {
        console.log(`[usersRepository]: setNewConfirmationCode userId: ${id}`);
        const result = await UserModel.updateOne(
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