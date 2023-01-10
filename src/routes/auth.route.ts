import {Router} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {authBearerMiddleware} from "../middlewares/authBearer.middleware";
import {
    refreshTokenValidator
} from "../middlewares/refresh-token-validator.middleware";
import {accessAttemptCounter} from "../middlewares/access-attempt-counter.middleware";
import {authController} from '../composition-root/compositiomRoot';

export const authRouter = Router();

const {
    validateLoginInputModel,
    validateUserInputModel,
    validateRegistrationEmailResendingModel,
    validateRegistrationConfirmationCodeModel,
    validateResult,
    validatePasswordRecoveryInputModel,
    validateNewPasswordRecoveryInputModel
} = validatorMiddleware;


authRouter.post('/login',
    accessAttemptCounter,
    validateLoginInputModel(),
    validateResult,
    authController.userLogin.bind(authController)
);

authRouter.get('/me',
    authBearerMiddleware,
    authController.getAuthInfoForUser.bind(authController)
);

authRouter.post('/registration',
    accessAttemptCounter,
    validateUserInputModel(),
    validateResult,
    authController.userRegistration.bind(authController)
);

authRouter.post('/registration-confirmation',
    accessAttemptCounter,
    validateRegistrationConfirmationCodeModel(),
    validateResult,
    authController.registrationConfirmation.bind(authController)
);


authRouter.post('/registration-email-resending',
    accessAttemptCounter,
    validateRegistrationEmailResendingModel(),
    validateResult,
    authController.registrationEmailResending.bind(authController)
);

authRouter.post('/refresh-token',
    accessAttemptCounter,
    refreshTokenValidator,
    authController.refreshToken.bind(authController)
);

authRouter.post('/logout',
    refreshTokenValidator,
    authController.userLogout.bind(authController)
);


authRouter.post('/password-recovery',
    accessAttemptCounter,
    validatePasswordRecoveryInputModel(),
    validateResult,
    authController.passwordRecovery.bind(authController)
);

authRouter.post('/new-password',
    accessAttemptCounter,
    validateNewPasswordRecoveryInputModel(),
    validateResult,
    authController.createNewPassword.bind(authController)
);

