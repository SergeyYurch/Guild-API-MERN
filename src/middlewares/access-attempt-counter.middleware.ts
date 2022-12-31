import {Request, Response, NextFunction} from 'express';
import {accessAttemptRepository} from "../repositories/access-attempt.repository";
import {getDeviceInfo} from '../helpers/helpers';

export const accessAttemptCounter = async (req: Request, res: Response, next: NextFunction) => {
    const endpoint = req.originalUrl;
    const deviceInfo =getDeviceInfo(req)
    const ip = deviceInfo.ip;
    console.log(`[accessAttemptCounter]-middleware run by ip: ${ip}, for url: ${endpoint}`);
    const attemptsCount = await accessAttemptRepository.getNumberOfAttemptsByIp(ip, endpoint);
    if (attemptsCount > 4) {
        console.log(`[accessAttemptCounter] for ip: ${ip} & url: ${endpoint} attempt limit exceeded`);
        return res.sendStatus(429);
    }
    const result = await accessAttemptRepository.saveAttempt(ip, endpoint);
    if (!result) return res.sendStatus(500);
    return next();

};
