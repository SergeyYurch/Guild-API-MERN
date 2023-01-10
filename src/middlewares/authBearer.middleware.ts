import {Request, Response, NextFunction} from 'express';
import {jwtService} from "../utils/jwt-service";
import {UsersService} from "../services/users.service";

const usersService = new UsersService();
export const authBearerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[authBearerMiddleware] started...`);
    if (!req.headers.authorization) {
        console.log(`[authBearerMiddleware] access denied - no headers.authorization`);
        return res.sendStatus(401);
    }
    const token = req.headers.authorization.split(' ')[1];
    const userId = await jwtService.getUserIdByJwtToken(token, "access");
    if (!userId) {
        console.log(`[authBearerMiddleware] access denied - no valid access token`);
        return res.sendStatus(401);
    };
    const user = await usersService.getUserById(userId);
    if(!user) {
        console.log(`[authBearerMiddleware] access denied - do not find user in DB`);
        return res.sendStatus(401);
    }
    req.user = user
    return next();

};