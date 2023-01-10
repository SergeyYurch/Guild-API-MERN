import {Router} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {authBasicMiddleware} from "../middlewares/authBasic.middleware";
import {blogsController} from '../composition-root/compositiomRoot';

export const blogsRouter = Router();

const {
    validateBlogInputModel,
    validatePostInputModel,
    validateResult
} = validatorMiddleware;

blogsRouter.get('/',
    blogsController.getBlogs.bind(blogsController)
);

blogsRouter.post('/',
    authBasicMiddleware,
    validateBlogInputModel(),
    validateResult,
    blogsController.createBlog.bind(blogsController)
);

blogsRouter.get('/:id',
    blogsController.getBlog.bind(blogsController)
);


blogsRouter.get('/:id/posts',
    blogsController.getPostsForBlog.bind(blogsController)
);

blogsRouter.post('/:id/posts',
    authBasicMiddleware,
    validatePostInputModel(),
    validateResult,
    blogsController.createPostForBlog.bind(blogsController)
);

blogsRouter.put('/:id',
    authBasicMiddleware,
    validateBlogInputModel(),
    validateResult,
    blogsController.editBlog.bind(blogsController)
);

blogsRouter.delete('/:id',
    authBasicMiddleware,
    blogsController.deleteBlog.bind(blogsController)
);
