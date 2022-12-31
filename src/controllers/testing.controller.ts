import {Router, Request, Response, NextFunction} from "express";
import {testsRepository} from "../repositories/tests.repository";
export const testingRouter = Router();

testingRouter.use((req: Request, res: Response, next: NextFunction) => {
    next();
});

testingRouter.delete('/all-data', async (req: Request, res: Response)=> {
        const result = await testsRepository.dataBaseClear();
        if (result) {
            res.sendStatus(204);
        } else {
            res.sendStatus(500);
        }
    }
);
