import {Router} from "express";
import {refreshTokenValidator} from "../middlewares/refresh-token-validator.middleware";
import {SecurityController} from '../controllers/security.controller';
import {securityController} from '../composition-root/compositiomRoot';

// const securityController = appContainer.get(SecurityController)
export const securityRouter = Router();



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


