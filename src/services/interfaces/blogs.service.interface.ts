import {BlogViewModelDto} from "../../controllers/dto/viewModels/blogViewModel.dto";
import {BlogInputModelDto} from "../../controllers/dto/inputModels/blogInputModel.dto";


export interface BlogsServiceInterface {
    createNewBlog: (post: BlogInputModelDto) => Promise<BlogViewModelDto | null>;
    editBlogById: (id: string, post:BlogInputModelDto) =>Promise<boolean>;
    deleteBlogById: (id: string) =>Promise< boolean>;
}