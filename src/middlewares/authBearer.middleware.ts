import {Request, Response, NextFunction} from 'express';
import {jwtService} from "../utils/jwt-service";
import {usersService} from "../services/users.service";

export const authBearerMiddleware =async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        return res.sendStatus(401);
    }
    const token= req.headers.authorization.split(' ')[1]
    const userId=await jwtService.getUserIdByJwtToken(token, "access");
    if (userId) {
        req.user= await usersService.getUserById(userId)
        return next()
    }
    return res.sendStatus(401);
};