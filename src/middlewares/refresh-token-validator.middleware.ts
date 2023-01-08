import {Request, Response, NextFunction} from 'express';
import {jwtService} from "../utils/jwt-service";
import {UsersService} from "../services/users.service";
import {AuthService} from "../services/auth.service";

const usersService = new UsersService();
const authService = new AuthService();

export const refreshTokenValidator = async (req: Request, res: Response, next: NextFunction) => {
    // const refreshToken = req.cookies.refreshToken;
    // if (!refreshToken) return res.sendStatus(401)
    // const tokenPayload = jwtService.getUserIdByJwtToken()
    console.log('[refreshTokenValidator]');
    const refreshToken = req.cookies?.refreshToken;
    console.log(`[refreshTokenValidator] refreshToken: ${refreshToken}`);

    try {
        console.log(`[refreshTokenValidator]: refreshToken : ${refreshToken}`);
        if (!refreshToken) return res.sendStatus(401);
        if (!jwtService.verifyJwtToken(refreshToken, 'refresh')) return res.sendStatus(401);
        const {lastActiveDate, userId, deviceId} = jwtService.getSessionInfoByJwtToken(refreshToken);
        const result = await authService.checkDeviceSession(deviceId, userId, lastActiveDate);
        console.log(`[refreshTokenValidator]: userId : ${result}`);
        if (result.status !== 'ok') return res.status(401).send(`no checkDeviceSession error:${result.message}`);
        req.user = await usersService.getUserById(userId);
        req.deviceId = deviceId;
        return next();
    } catch (error) {
        return res.sendStatus(500);
    }
};