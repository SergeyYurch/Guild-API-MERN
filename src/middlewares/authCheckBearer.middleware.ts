import {Request, Response, NextFunction} from 'express';
import {jwtService} from "../utils/jwt-service";
import {UsersService} from '../services/users.service';
import {usersService} from '../composition-root/compositiomRoot';

// const usersService = appContainer.get(UsersService)

export const authCheckBearerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        return next();
    }
    const token = req.headers.authorization.split(' ')[1];
    const userId = await jwtService.getUserIdByJwtToken(token, "access");
    if (userId) {
        req.user = await usersService.getUserById(userId);
        return next();
    }
    return next();
};