import {Router} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {authBearerMiddleware} from "../middlewares/authBearer.middleware";
import {authCheckBearerMiddleware} from '../middlewares/authCheckBearer.middleware';
import {commentsController} from '../composition-root/compositiomRoot';

export const commentsRouter = Router();

const {
    validateCommentInputModel,
    validateLikeInputModel,
    validateResult
} = validatorMiddleware;

commentsRouter.put('/:commentId',
    authBearerMiddleware,
    validateCommentInputModel(),
    validateResult,
    commentsController.editComment.bind(commentsController)
);

commentsRouter.put('/:commentId/like-status',
    authBearerMiddleware,
    validateLikeInputModel(),
    validateResult,
    commentsController.changeLikeStatus.bind(commentsController)
);

commentsRouter.delete('/:commentId',
    authBearerMiddleware,
    commentsController.deleteComment.bind(commentsController)
);

commentsRouter.get('/:commentId',
    authCheckBearerMiddleware,
    commentsController.getComment.bind(commentsController)
);