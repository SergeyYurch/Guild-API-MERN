import {Router} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {authBasicMiddleware} from "../middlewares/authBasic.middleware";
import {UserController} from '../controllers/users.controller';
import {userController} from '../composition-root/compositiomRoot';

// const userController = appContainer.get(UserController)
export const usersRouter = Router();

const {
    validateUserInputModel,
    validateResult
} = validatorMiddleware;

usersRouter.get('/:id',
    userController.getUser.bind(userController));

usersRouter.post('/',
    authBasicMiddleware,
    validateUserInputModel(),
    validateResult,
    userController.createUser.bind(userController));

usersRouter.get('/',
    authBasicMiddleware,
    userController.getUsers.bind(userController));

usersRouter.delete('/:id',
    authBasicMiddleware,
    userController.deleteUser.bind(userController));