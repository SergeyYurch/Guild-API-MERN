import {Schema} from 'mongoose';
import {AuthSessionEntity} from '../../services/entities/auth-session.entity';

export const sessionSchema = new Schema<AuthSessionEntity>({
    deviceId:String,
    ip: String,
    title: String,
    lastActiveDate: String,
    expiresDate: String,
    userId: String,
});