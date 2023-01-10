import {AuthSessionEntity} from "../services/entities/auth-session.entity";
import {SessionModel} from "../adapters/dbAdapters";
import {ObjectId} from "mongodb";
import {AuthSessionInDb} from "./repository-interfaces/auth-session-in-db.interface";


export class AuthSessionsRepository {
    async cleanAuthSessionsCollection(): Promise<void> {
        //Чистим базу - Удаляем все заэкспайреные сессии
        console.log(`[authSessionsRepository]/cleanAuthSessionsCollection `);
        await SessionModel.deleteMany({
            expiresDate: {$lt: new Date().getTime()}
        });
    }

    async saveDeviceAuthSession(session: AuthSessionEntity) {
        //сохраняем сессию в базу и возвращаем true если операция была успешна
        console.log(`[deviceAuthSessionsRepository]:saveDeviceAuthSession`);
        console.log(session);

        await this.cleanAuthSessionsCollection();
        const {deviceId, ip, expiresDate, userId, lastActiveDate, title} = session;
        return SessionModel.create({
            deviceId,
            title,
            lastActiveDate,
            userId,
            ip,
            expiresDate
        });
    }

    async updateDeviceAuthSession(session: AuthSessionEntity): Promise<boolean> {
        //обновляем сессию в базе и возвращаем true если операция была успешна
        console.log(`[deviceAuthSessionsRepository]:updateDeviceAuthSession: ${session.deviceId}`);
        await this.cleanAuthSessionsCollection();
        const {deviceId, expiresDate, lastActiveDate} = session;
        const result = await SessionModel.updateOne(
            {deviceId},
            {lastActiveDate, expiresDate});
        return result.acknowledged;
    }

    async getDeviceAuthSessionByDeviceId(deviceId: string): Promise<AuthSessionInDb | null> {
        console.log(`[deviceAuthSessionsRepository]: getDeviceAuthSessionById:${deviceId}`);
        await this.cleanAuthSessionsCollection();
        const result = await SessionModel.findOne({deviceId});
        if (!result) return null;
        return ({
            ip: result.ip,
            title: result.title,
            lastActiveDate: result.lastActiveDate,
            deviceId: result._id.toString(),
            userId: result.userId
        });
    }

    async getAllSessionByUserId(userId: string): Promise<AuthSessionInDb[]> {
        console.log(`[deviceAuthSessionsRepository]: getAllSessionByUserId: ${userId}`);
        await this.cleanAuthSessionsCollection();
        const sessions = await SessionModel.find({
            userId
        });
        return sessions.map(s => ({
            ip: s.ip,
            title: s.title,
            lastActiveDate: s.lastActiveDate,
            userId: s.userId,
            deviceId: s._id.toString()
        }));
    }

    async deleteSessionExcludeId(id: string, userId: string): Promise<boolean> {
        console.log(`[deviceAuthSessionsRepository]: deleteSessionExcludeById`);
        await this.cleanAuthSessionsCollection();
        const result = await SessionModel.deleteMany({
            $and: [{userId}, {_id: {$ne: new ObjectId(id)}}]
        });
        return result.acknowledged;
    }

    async deleteSessionById(deviceId: string): Promise<boolean> {
        console.log(`[deviceAuthSessionsRepository]: deleteSessionById: ${deviceId}`);
        const result = await SessionModel.deleteOne({
            deviceId
        });
        return result.acknowledged;
    }
};