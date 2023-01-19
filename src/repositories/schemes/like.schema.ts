import {Schema} from 'mongoose';
import {LikeEntity} from '../../services/entities/like.entity';

export const likeSchema = new Schema<LikeEntity>({
    userId: String,
    login: String,
    targetId: String,
    likeStatus: String,
    addedAt: String
});