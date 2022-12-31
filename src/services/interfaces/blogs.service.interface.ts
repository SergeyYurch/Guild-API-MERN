import {BlogViewModelDto} from "../../controllers/dto/blogViewModel.dto";
import {BlogInputModelDto} from "../../controllers/dto/blogInputModel.dto";


export interface BlogsServiceInterface {
    createNewBlog: (post: BlogInputModelDto) => Promise<BlogViewModelDto | null>;
    editBlogById: (id: string, post:BlogInputModelDto) =>Promise<boolean>;
    deleteBlogById: (id: string) =>Promise< boolean>;
}