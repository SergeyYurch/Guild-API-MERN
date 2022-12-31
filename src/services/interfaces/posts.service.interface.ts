import {PostViewModelDto} from "../../controllers/dto/postViewModel.dto";
import {PostInputModelDto} from "../../controllers/dto/postInputModel.dto";

export interface PostsServiceInterface {
    createNewPost: (post: PostInputModelDto) => Promise<PostViewModelDto | null>;
    editPostById: (id: string, post:PostInputModelDto) =>Promise<boolean>;
    deletePostById: (id: string) => Promise<boolean>;
}