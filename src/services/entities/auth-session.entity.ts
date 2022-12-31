import {ObjectId} from 'mongodb';

export interface AuthSessionEntity {
    deviceId:string;
    ip: string;
    title: string;
    lastActiveDate: string;
    expiresDate:string;
    userId: string;
}