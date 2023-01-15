import {Request, Response} from "express";
import {TestsRepository} from "../repositories/tests.repository";
import {injectable} from 'inversify';


@injectable()
export class TestingController {

    constructor(
        protected testsRepository: TestsRepository
    ) {
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
