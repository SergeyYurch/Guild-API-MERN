import {Router, Response, Request} from "express";
import {RequestWithId} from "../types/request.type";
import {ObjectId} from "mongodb";
import {AuthService} from "../services/auth.service";
import {refreshTokenValidator} from "../middlewares/refresh-token-validator.middleware";
import {jwtService} from "../utils/jwt-service";

export const securityRouter = Router();

export class SecurityController {
    private authService:AuthService
    constructor() {
        this.authService = new AuthService()
    }

    async getDeviceSessions(req: Request, res: Response) {
        console.log(`!!!![securityRouter]:GET /devices`);
        const refreshToken = req.cookies.refreshToken;

        try {
            const userInfo = await jwtService.getSessionInfoByJwtToken(refreshToken);
            const result = await this.authService.getAllSessionByUserId(userInfo!.userId);
            return res.status(200).send(result);
        } catch (error) {
            console.log(error);
            return res.sendStatus(500);
        }
    }

    async deleteOtherDeviceSessions(req: Request, res: Response) {
        console.log(`!!!![securityRouter]:GET /devices`);
        try {
            const result = await this.authService.deleteAllSessionExcludeCurrent(req.cookies.refreshToken);
            if (result) return res.sendStatus(204);
            return res.sendStatus(500);
        } catch (error) {
            return res.sendStatus(500);
        }
    }

    async  deleteDeviceSession(req: RequestWithId, res: Response) {
        console.log(`!!!![securityRouter]:DELETE/devices/deviceId`);
        try {
            const refreshToken = req.cookies.refreshToken;
            const deviceId = req.params.deviceId;
            if (!ObjectId.isValid(deviceId)) return res.sendStatus(404);
            const authSession = await this.authService.getAuthSessionById(deviceId);
            console.log(`!!!![securityRouter]::DELETE/devices/deviceId authSession:${authSession}`);
            if (!authSession) return res.sendStatus(404);
            const userInfo = await jwtService.getSessionInfoByJwtToken(refreshToken);
            if (authSession.userId !== userInfo!.userId) return res.sendStatus(403);
            const result = await this.authService.deleteSessionById(deviceId);
            if (!result) return res.sendStatus(500);
            return res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    }
}

const securityController = new SecurityController();

securityRouter.get('/devices',
    refreshTokenValidator,
    securityController.getDeviceSessions.bind(securityController)
);

securityRouter.delete('/devices',
    refreshTokenValidator,
    securityController.deleteOtherDeviceSessions.bind(securityController)
);

securityRouter.delete('/devices/:deviceId',
    refreshTokenValidator,
    securityController.deleteDeviceSession.bind(securityController)
);


