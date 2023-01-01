import {ObjectId} from 'mongodb';

export interface DbAuthSessionInterface {
    ip: string;
    title: string;
    lastActiveDate: string;
    expiresDate:string;
    userId: string;
}