import {Router, Request, Response} from "express";
import {TestsRepository} from "../repositories/tests.repository";

export const testingRouter = Router();

export class TestingController {
    private testsRepository:TestsRepository
    constructor() {
        this.testsRepository = new TestsRepository()
    }
    async clearDataBase(req: Request, res: Response) {
        const result = await this.testsRepository.dataBaseClear();
        if (result) {
            res.sendStatus(204);
        } else {
            res.sendStatus(500);
        }
    }
}
const testingController = new TestingController()

testingRouter.delete('/all-data',
    testingController.clearDataBase.bind(testingController)
);
