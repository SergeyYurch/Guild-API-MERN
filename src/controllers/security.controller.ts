import {Router, Response, Request} from "express";
import {RequestWithId} from "../types/request.type";
import {ObjectId} from "mongodb";
import {getDeviceInfo} from "../helpers/helpers";
import {authService} from "../services/auth.service";
import {refreshTokenValidator} from "../middlewares/refresh-token-validator.middleware";
import {jwtService} from "../utils/jwt-service";
import {accessAttemptCounter} from '../middlewares/access-attempt-counter.middleware';

export const securityRouter = Router();

securityRouter.get('/devices',
    refreshTokenValidator,
    async (req: Request, res: Response) => {
        console.log(`!!!![securityRouter]:GET /devices`);
        const refreshToken = req.cookies.refreshToken;

        try {
            const userInfo = await jwtService.getSessionInfoByJwtToken(refreshToken);
            const result = await authService.getAllSessionByUserId(userInfo!.userId);
            return res.status(200).send(result);
        } catch (error) {
            console.log(error);
            return res.sendStatus(500);
        }
    }
);

securityRouter.delete('/devices',
    refreshTokenValidator,
    async (req: Request, res: Response) => {
        console.log(`!!!![securityRouter]:GET /devices`);
        try {
            const result = await authService.deleteAllSessionExcludeCurrent(req.cookies.refreshToken);
            if (result) return res.sendStatus(204);
            return res.sendStatus(500);
        } catch (error) {
            return res.sendStatus(500);
        }
    }
);

securityRouter.delete('/devices/:deviceId',
    refreshTokenValidator,
    async (req: RequestWithId, res: Response) => {
        console.log(`!!!![securityRouter]:DELETE/devices/deviceId`);
        try {
            const refreshToken = req.cookies.refreshToken;
            const deviceId = req.params.deviceId;
            if (!ObjectId.isValid(deviceId)) return res.sendStatus(404);
            const authSession = await authService.getAuthSessionById(deviceId);
            console.log(`!!!![securityRouter]::DELETE/devices/deviceId authSession:${authSession}`);
            if (!authSession) return res.sendStatus(404);
            const userInfo = await jwtService.getSessionInfoByJwtToken(refreshToken);
            if (authSession.userId !== userInfo!.userId) return res.sendStatus(403);
            const result = await authService.deleteSessionById(deviceId);
            if (!result) return res.sendStatus(500);
            return res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    }
);


