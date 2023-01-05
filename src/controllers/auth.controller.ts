import {Router, Response, Request} from "express";
import {validatorMiddleware} from "../middlewares/validator.middleware";
import {RequestWithBody} from "../types/request.type";
import {LoginInputModel} from "./dto/loginInputModel.dto";
import {usersService} from "../services/users.service";
import {authBearerMiddleware} from "../middlewares/authBearer.middleware";
import {UserInputModelDto} from "./dto/userInputModel.dto";
import {RegistrationEmailResendingModelDto} from "./dto/registrationEmailResendingModel.dto";
import {authService} from "../services/auth.service";
import {getDeviceInfo, setRefreshTokenToCookie} from "../helpers/helpers";
import {
    refreshTokenValidator
} from "../middlewares/refresh-token-validator.middleware";
import {accessAttemptCounter} from "../middlewares/access-attempt-counter.middleware";
import {PasswordRecoveryInputModel} from './dto/passwordRecoveryInputModel.dto';
import {NewPasswordRecoveryInputModel} from './dto/newPasswordRecoveryInputModel.dto';

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
    async (req: RequestWithBody<LoginInputModel>, res: Response) => {
        try {
            const {loginOrEmail, password} = req.body;
            console.log(`!!!![authRouter] login:${loginOrEmail}`);
            const user = await authService.checkCredentials({loginOrEmail, password});
            if (!user) return res.sendStatus(401);
            const {ip, title} = getDeviceInfo(req);
            const loginParams = await authService.userLogin(user.id, ip, title);
            if (!loginParams) return res.sendStatus(503);
            setRefreshTokenToCookie(res, loginParams.refreshToken);
            return res.status(200)
                .send({"accessToken": loginParams.accessToken});
        } catch (error) {
            return res.sendStatus(500);
        }
    }
);

authRouter.get('/me',
    authBearerMiddleware,
    async (req: RequestWithBody<LoginInputModel>, res: Response) => {
        try {
            console.log(`[authController]/GET:auth/me started`);
            const userId = req.user!.id;
            console.log(`[authController]:get user info by ID: ${userId}`);
            const userInDb = await usersService.getUserById(userId);
            if (!userInDb) return res.sendStatus(401);
            return res.status(200).send({
                email: userInDb.email,
                login: userInDb.login,
                userId
            });
        } catch (error) {
            return res.sendStatus(500);
        }
    });

authRouter.post('/registration',
    accessAttemptCounter,
    validateUserInputModel(),
    validateResult,
    async (req: RequestWithBody<UserInputModelDto>, res: Response) => {
        console.log(`[authController]:POST/registration run`);
        try {
            const {login, password, email} = req.body;

            const newUser = await usersService.createNewUser(login, email, password);
            if (newUser) return res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    });

authRouter.post('/registration-confirmation',
    accessAttemptCounter,
    validateRegistrationConfirmationCodeModel(),
    validateResult,
    async (req: Request, res: Response) => {
        console.log(`[authController]:POST/registration-confirmation run`);
        try {
            const code = String(req.body.code);
            const result = await authService.confirmEmail(code);
            if (!result) res.sendStatus(400);
            return res.sendStatus(204);

        } catch (error) {
            return res.sendStatus(500);
        }
    });


authRouter.post('/registration-email-resending',
    accessAttemptCounter,
    validateRegistrationEmailResendingModel(),
    validateResult,
    async (req: RequestWithBody<RegistrationEmailResendingModelDto>, res: Response) => {
        console.log(`[authController]:POST/registration-email-resending run`);
        try {
            const {email} = req.body;
            const user = await usersService.findUserByEmailOrLogin(email);
            const result = await authService.resendingEmail(user!.id);
            if (!result) return res.status(400).send(
                {"errorsMessages": [{"message": "can\'t send email", "field": "email"}]}
            );
            return res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    });

authRouter.post('/refresh-token',
    accessAttemptCounter,
    refreshTokenValidator,
    async (req: Request, res: Response) => {
        console.log(`[authController]:POST/refresh-token run`);
        try {
            const {ip, title} = getDeviceInfo(req);
            const userId = req.user?.id;
            const deviceId = req.deviceId;
            const tokensPair = await authService.userRefreshTokens(userId!, deviceId!, ip, title);
            if (!tokensPair) return res.sendStatus(500);
            setRefreshTokenToCookie(res, tokensPair.refreshToken);
            return res.status(200).send({
                "accessToken": tokensPair.accessToken
            });
        } catch (error) {

            return res.sendStatus(500);
        }
    });

authRouter.post('/logout',
    refreshTokenValidator,
    async (req: Request, res: Response) => {
        console.log(`[authController]:POST/logout run`);
        try {
            const inputRefreshToken = req.cookies.refreshToken;
            const result = await authService.userLogout(inputRefreshToken);
            if (!result) return res.sendStatus(500);
            res.clearCookie('refreshToken');
            return res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    });


authRouter.post('/password-recovery',
    accessAttemptCounter,
    validatePasswordRecoveryInputModel(),
    validateResult,
    async (req: RequestWithBody<PasswordRecoveryInputModel>, res: Response) => {
        console.log(`[authController]:POST/password-recovery run`);
        try {
            const {email} = req.body;
            await authService.passwordRecovery( email);
            return res.sendStatus(204);
        } catch (error) {
            return res.sendStatus(500);
        }
    });

authRouter.post('/new-password',
    accessAttemptCounter,
    validateNewPasswordRecoveryInputModel(),
    validateResult,
    async (req: RequestWithBody<NewPasswordRecoveryInputModel>, res: Response) => {
        console.log(`[authController]:POST/password-recovery run`);
        try {
            const {newPassword, recoveryCode} = req.body;
            const result = await authService.confirmPasswordRecovery( newPassword, recoveryCode);
            return result ? res.sendStatus(204) : res.sendStatus(400);
        } catch (error) {
            return res.sendStatus(500);
        }
    });

