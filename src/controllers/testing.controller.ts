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
            console.log('[testingController] database clean - successful, send 204');
            res.sendStatus(204);
        } else {
            console.log('[testingController] database clean - server error, send 500');
            res.sendStatus(500);
        }
    }
}
