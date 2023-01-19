import {LikesInfoViewModelInterface} from './likesInfoViewModel.interface';
import {LikeDetailsViewModel} from './ likeDetailsViewModel';

export interface ExtendedLikesInfoViewModel extends LikesInfoViewModelInterface{
    newestLikes: null | LikeDetailsViewModel[]
}