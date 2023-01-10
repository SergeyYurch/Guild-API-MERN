import {LikesInfoViewModelInterface} from './likesInfoViewModel.interface';

export interface CommentViewModelDto {
    id: string,
    content: string,
    userId: string,
    userLogin: string,
    createdAt: string,
    likesInfo: LikesInfoViewModelInterface
}