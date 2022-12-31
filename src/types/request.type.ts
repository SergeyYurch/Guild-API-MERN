import {Request} from 'express';

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithId= Request<{[id:string]:string}>;
export type  RequestWithParamsAndBody<T, B> = Request<T, {}, B>
export type  RequestWithIdAndBody<T> = Request<{[id:string]:string}, {},T>