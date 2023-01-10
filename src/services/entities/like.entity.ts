import {LikeStatusType} from '../../controllers/interfaces/likeStatus.type';

export interface LikeEntity {
    userId: string;
    commentId:string;
    likeStatus: LikeStatusType;
    createdAt:Date;
}