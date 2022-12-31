import express, {Express} from 'express';
import * as dotenv from 'dotenv';
import {testingRouter} from "./controllers/testing.controller";
import {blogsRouter} from "./controllers/blogs.controller";
import {postsRouter} from "./controllers/posts.controller";
// import {authGuardMiddleware} from "./middlewares/authGuard.middleware";
import {Server} from "http";
import {runDB} from "./adapters/dbAdapters";

dotenv.config();

export class App {
    app: Express;
    port: number;
    server!: Server;

    constructor() {
        this.app = express();
        this.port = process.env.PORT ? +process.env.PORT : 5001;
    }

    useMiddleware(): void {
        this.app.use(express.json());
        // this.app.use(authGuardMiddleware);
    }

    useRouters(): void {
        this.app.use('/blogs', blogsRouter);
        this.app.use('/posts', postsRouter);
        this.app.use('/testing', testingRouter);
    }

    public async init() {
        this.useMiddleware();
        this.useRouters();
        await runDB();
        this.server = this.app.listen(this.port, ()=>{
            console.log(`[App] Server on post:${this.port} is start `);
        });

    }
}
