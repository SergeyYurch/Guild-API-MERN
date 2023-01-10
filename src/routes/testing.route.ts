import {Router} from "express";
import {testingController} from '../composition-root/compositiomRoot';

export const testingRouter = Router();

testingRouter.delete('/all-data',
    testingController.clearDataBase.bind(testingController)
);
