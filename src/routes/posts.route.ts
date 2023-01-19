import {Router} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {authBasicMiddleware} from "../middlewares/authBasic.middleware";
import {authBearerMiddleware} from "../middlewares/authBearer.middleware";
import {authCheckBearerMiddleware} from '../middlewares/authCheckBearer.middleware';
import {postsController} from '../composition-root/compositiomRoot';
import {PostsController} from '../controllers/posts.controller';

// const postsController = appContainer.get(PostsController)
export const postsRouter = Router();
const {
    validatePostInputModel,
    validateResult,
    validateBlogId,
    validateCommentInputModel,
    validateLikeInputModel
} = validatorMiddleware;

postsRouter.get('/', postsController.getPosts.bind(postsController));

postsRouter.post(
    '/',
    authBasicMiddleware,
    validatePostInputModel(),
    validateBlogId(),
    validateResult,
    postsController.createPost.bind(postsController)
);

postsRouter.get('/:id',
    authCheckBearerMiddleware,
    postsController.getPost.bind(postsController));

postsRouter.put(
    '/:id',
    authBasicMiddleware,
    validatePostInputModel(),
    validateBlogId(),
    validateResult,
    postsController.editPost.bind(postsController)
);

postsRouter.delete('/:id',
    authBasicMiddleware,
    postsController.deletePost.bind(postsController)
);

postsRouter.post('/:postId/comments',
    authBearerMiddleware,
    validateCommentInputModel(),
    validateResult,
    postsController.createCommentForPost.bind(postsController)
);

postsRouter.get('/:postId/comments',
    authCheckBearerMiddleware,
    postsController.getCommentsForPost.bind(postsController)
);

postsRouter.put(
    '/:postId/like-status',
    authBearerMiddleware,
    validateLikeInputModel(),
    validateResult,
    postsController.editPostLikeStatus.bind(postsController)
);