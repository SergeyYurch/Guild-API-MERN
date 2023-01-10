import {LikeStatusType} from '../../../repositories/interfaces/likeStatus.type';

export interface LikesInfoViewModelInterface{
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatusType
}