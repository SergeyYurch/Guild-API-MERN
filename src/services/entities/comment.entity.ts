import {LikesInfoViewModelInterface} from '../../controllers/interfaces/likesInfoViewModel.interface';

export interface CommentEntity {
    content: string;
    postId:string;
    userId: string;
    userLogin: string;
    createdAt: string;
}