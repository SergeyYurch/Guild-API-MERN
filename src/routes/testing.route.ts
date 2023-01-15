import {Router} from "express";
import {testingController} from '../composition-root/compositiomRoot';
import {TestingController} from '../controllers/testing.controller';

// const testingController = appContainer.get(TestingController)
export const testingRouter = Router();

testingRouter.delete('/all-data',
    testingController.clearDataBase.bind(testingController)
);
