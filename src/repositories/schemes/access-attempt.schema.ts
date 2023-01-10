import {Schema} from 'mongoose';
import {AccessAttemptEntity} from '../../services/entities/access-attempt.entity';

export const accessAttemptSchema = new Schema<AccessAttemptEntity>( {
    ip: String,
    endpoint: String,
    createdAt: Date
})