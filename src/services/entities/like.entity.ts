import {LikeStatusType} from '../../repositories/interfaces/likeStatus.type';

export interface LikeEntity {
    userId: string;
    login: string;
    targetId:string;
    likeStatus: LikeStatusType;
    addedAt:Date;
}