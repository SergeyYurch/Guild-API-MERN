import {LikeStatusType} from './likeStatus.type';

export interface LikesInfoViewModelInterface{
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatusType
}