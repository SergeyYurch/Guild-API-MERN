import {Request, Response, NextFunction} from "express";
import {body, validationResult} from 'express-validator';
import {APIErrorResultModel} from "../controllers/dto/apiErrorResult.dto";
import {queryRepository} from "../repositories/query.repository";
import {usersService} from "../services/users.service";
import {authService} from "../services/auth.service";
import {usersRepository} from '../repositories/users.repository';

export const validatorMiddleware = {
    validateRegistrationConfirmationCodeModel: () => [
        body('code')
            .exists()
            .withMessage('code is required')
            .custom(
                async (code) => {
                    const result = await authService.findCorrectConfirmationCode(code);
                    if (!result) throw new Error();
                })
            .withMessage('confirmation code is incorrect, expired or already been applied')
    ],
    validateRegistrationEmailResendingModel: () => [
        body('email')
            .trim()
            .exists()
            .withMessage('email is required')
            .matches(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)
            .withMessage('email is wrong')
            .custom(
                async (email) => {
                    const user = await usersService.findUserByEmailOrLogin(email);
                    if (!user) throw new Error();
                })
            .withMessage('email is wrong')
    ],
    validateCommentInputModel: () => [
        body('content')
            .exists()
            .withMessage('content is required')
            .isLength({min: 20, max: 300})
            .withMessage('content length is wrong')
    ],
    validateLoginInputModel: () => [
        body('loginOrEmail')
            .trim()
            .isLength({min: 1})
            .withMessage('name must be min 1 chars long')
            .exists()
            .withMessage('loginOrEmail is required'),
        body('password')
            .exists()
            .withMessage('password is required')
            .isLength({min: 6, max: 20})
            .withMessage('password must be min 1 chars long')
    ],
    validateUserInputModel: () => [
        body('login')
            .trim()
            .isLength({min: 3, max: 10})
            .withMessage('length of login must be 3-10 chars')
            .matches(/^[a-zA-Z0-9_-]*$/)
            .withMessage('login is wrong')
            .exists()
            .withMessage('login is required')
            .custom(async (login) => {
                const user = await usersService.findUserByEmailOrLogin(login);
                if (user) throw new Error();
            })
            .withMessage('login is already registered'),

        body('password')
            .isLength({min: 6, max: 20})
            .withMessage('length of password must be  6-20 chars')
            .exists()
            .withMessage('password is required'),
        body('email')
            .trim()
            .exists()
            .withMessage('email is required')
            .matches(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)
            .withMessage('email is wrong')
            .custom(async (email) => {
                const user = await usersService.findUserByEmailOrLogin(email);
                if (user) throw new Error();
            })
            .withMessage('email is already registered'),
    ],
    validatePasswordRecoveryInputModel: () => [
        body('email')
            .trim()
            .exists()
            .withMessage('email is required')
            .matches(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)
            .withMessage('email is wrong')
    ],
    validateNewPasswordRecoveryInputModel: () => [
        body('newPassword')
            .exists()
            .withMessage('password is required')
            .isLength({min: 6, max: 20})
            .withMessage('newPassword must be min 1 chars long'),
        body('recoveryCode')
            .exists()
            .withMessage('recoveryCode is required')
            // .custom(async (recoveryCode) => {
            //     const user = await usersRepository.findUserByPasswordRecoveryCode(recoveryCode);
            //     if (!user) throw new Error();
            //     if(!user.passwordRecoveryInformation) throw new Error();
            //     if(user.passwordRecoveryInformation.recoveryCode!==recoveryCode) throw new Error()
            //     if(user.passwordRecoveryInformation.expirationDate < new Date()) throw new Error()
            // })
            // .withMessage('recoveryCode is wrong')
    ],
    validateBlogInputModel: () => [
        body('name')
            .trim()
            .isLength({min: 1, max: 15})
            .withMessage('name must be at max 10 chars long')
            .exists()
            .withMessage('name is required'),
        body('description')
            .trim()
            .exists()
            .withMessage('description is required')
            .isLength({min: 1, max: 500})
            .withMessage('length is wrong'),
        body('websiteUrl')
            .exists()
            .trim()
            .isLength({max: 100})
            .withMessage('websiteUrl must be at max 100 chars long')
            .matches(/^https:\/\/([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
            .exists()
            .withMessage('name is required')
    ],
    validatePostInputModel: () => [
        body('title')
            .exists()
            .trim()
            .withMessage('title is required')
            .isLength({min: 1, max: 30})
            .withMessage('title must be at max 30 chars long'),
        body('shortDescription')
            .exists()
            .trim()
            .withMessage('shortDescription is required')
            .isLength({min: 1, max: 100})
            .withMessage('shortDescription must be at max 100 chars long'),
        body('content')
            .exists()
            .trim()
            .isLength({min: 1, max: 1000})
            .withMessage('content must be at max 1000 chars long'),
    ],
    validateBlogId: () => [
        body('blogId')
            .trim()
            .custom(
                async (blogId) => {
                    console.log(blogId);
                    const blog = await queryRepository.getBlogById(blogId);
                    if (!blog) throw new Error();
                }
            )
            .exists()
            .withMessage('blogId is required')
    ],
    validateResult: (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        const errorMessages: APIErrorResultModel = {
            errorsMessages: result.array({onlyFirstError: true}).map(e => ({
                message: e.msg,
                field: e.param
            }))
        };
        if (!result.isEmpty()) return res.status(400).json(errorMessages);
        return next();
    }
};