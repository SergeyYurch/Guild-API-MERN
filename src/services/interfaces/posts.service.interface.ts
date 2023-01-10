import {PostViewModelDto} from "../../controllers/dto/viewModels/postViewModel.dto";
import {PostInputModelDto} from "../../controllers/dto/inputModels/postInputModel.dto";

export interface PostsServiceInterface {
    createNewPost: (post: PostInputModelDto) => Promise<PostViewModelDto | null>;
    editPostById: (id: string, post:PostInputModelDto) =>Promise<boolean>;
    deletePostById: (id: string) => Promise<boolean>;
}