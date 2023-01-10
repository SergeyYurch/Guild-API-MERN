import {LikeStatusType} from '../../repositories/interfaces/likeStatus.type';

export interface LikeEntity {
    userId: string;
    commentId:string;
    likeStatus: LikeStatusType;
    createdAt:Date;
}