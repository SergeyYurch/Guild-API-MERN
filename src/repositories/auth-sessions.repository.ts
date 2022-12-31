import {AuthSessionEntity} from "../services/entities/auth-session.entity";
import {deviceAuthSessionsCollection} from "../adapters/dbAdapters";
import {ObjectId} from "mongodb";
import {AuthSessionInDb} from "./entitiesRepository/auth-session-in-db.interface";


export const authSessionsRepository = {
    async cleanAuthSessionsCollection(): Promise<void> {
        console.log(`[authSessionsRepository]/cleanAuthSessionsCollection `);
        // await deviceAuthSessionsCollection.deleteMany({
        //     expiresDate: {$lt: new Date()}
        // });
    },
    async saveDeviceAuthSession(session: AuthSessionEntity) {
        //сохраняем сессию в базу и возвращаем true если операция была успешна
        console.log(`[deviceAuthSessionsRepository]:saveDeviceAuthSession`);
        await this.cleanAuthSessionsCollection();
        const {deviceId, ip, expiresDate, userId, lastActiveDate, title} = session;
        return deviceAuthSessionsCollection.insertOne({
            _id: new ObjectId(deviceId),
            title,
            lastActiveDate,
            userId,
            ip,
            expiresDate
        });
    },
    async updateDeviceAuthSession(session: AuthSessionEntity) {
        //обновляем сессию в базе и возвращаем true если операция была успешна
        console.log(`[deviceAuthSessionsRepository]:updateDeviceAuthSession: ${session.deviceId}`);
        await this.cleanAuthSessionsCollection();
        const {deviceId, expiresDate, lastActiveDate} = session;
        return deviceAuthSessionsCollection.updateOne({_id: new ObjectId(deviceId)}, {
            $set: {
                lastActiveDate,
                expiresDate
            }
        });
    },

    async getDeviceAuthSessionById(deviceId: string): Promise<AuthSessionInDb | null> {
        console.log(`[deviceAuthSessionsRepository]: getDeviceAuthSessionById:${deviceId}`);
        await this.cleanAuthSessionsCollection();
        const result = await deviceAuthSessionsCollection.findOne({
            _id: new ObjectId(deviceId)
        });
        console.log(`[deviceAuthSessionsRepository]: getDeviceAuthSessionById  result:${result}`);
        if (!result) return null;
        return ({
            ip: result.ip,
            title: result.title,
            lastActiveDate: result.lastActiveDate,
            deviceId: result._id.toString(),
            userId: result.userId
        });
    },
    async getAllSessionByUserId(userId: string): Promise<AuthSessionInDb[]> {
        console.log(`[deviceAuthSessionsRepository]: getAllSessionByUserId: ${userId}`);
        // await this.cleanAuthSessionsCollection();
        const sessions = await deviceAuthSessionsCollection.find({
            userId
        }).toArray();
        return sessions.map(s => ({
            ip: s.ip,
            title: s.title,
            lastActiveDate: s.lastActiveDate,
            userId: s.userId,
            deviceId: s._id.toString()
        }));
    },
    async deleteSessionExcludeId(id: string, userId: string): Promise<boolean> {
        console.log(`[deviceAuthSessionsRepository]: deleteSessionExcludeById`);
        await this.cleanAuthSessionsCollection();
        const result = await deviceAuthSessionsCollection.deleteMany({
            $and: [{userId}, {_id: {$ne: new ObjectId(id)}}]
        });

        console.log(`[deviceAuthSessionsRepository]: deleteSessionExcludeById result: ${result.acknowledged}`);
        return result.acknowledged;
    },
    async getPreviousUserSessionFromThisDevice(userId: string, title: string): Promise<string | null> {
        console.log(`[deviceAuthSessionsRepository]: checkPreviousUserSessionFromThisDevice`);
        await this.cleanAuthSessionsCollection();
        const result = await deviceAuthSessionsCollection.findOne({
            userId, title
        });
        console.log(`[deviceAuthSessionsRepository]: checkPreviousUserSessionFromThisDevice result: ${result?._id.toString()}`);
        return result?._id.toString() || null;
    },
    async deleteSessionById(deviceId: string): Promise<boolean> {
        console.log(`[deviceAuthSessionsRepository]: deleteSessionById: ${deviceId}`);
        const result = await deviceAuthSessionsCollection.deleteOne({
            _id: new ObjectId(deviceId),
        });
        return result.acknowledged;
    },
};