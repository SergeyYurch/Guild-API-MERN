import express, {Express} from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import {blogsRouter} from './routes/blogs.route';
import {postsRouter} from './routes/posts.route';
import {testingRouter} from './routes/testing.route';
import {authRouter} from './routes/auth.route';
import {usersRouter} from './routes/users.route';
import {securityRouter} from './routes/security.route';
import {commentsRouter} from './routes/comments.route';
import {Server} from 'http';
import {runDB} from './adapters/dbAdapters';
import {injectable} from 'inversify';


const port = process.env.PORT || 5001;

@injectable()
export class App {
    app: Express;
    port: number;
    server!: Server;

    constructor() {
        this.app = express();
        this.port = +port;
    }

    useMiddleware(): void {
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    useRouters(): void {
        this.app.use('/blogs', blogsRouter);
        this.app.use('/posts', postsRouter);
        this.app.use('/testing', testingRouter);
        this.app.use('/auth', authRouter);
        this.app.use('/users', usersRouter);
        this.app.use('/comments', commentsRouter);
        this.app.use('/security', securityRouter);
    }

    public async init() {
        this.app.set('trust proxy', true);
        this.useMiddleware();
        this.useRouters();
        await runDB();
        this.server = this.app.listen(this.port, () => {
            console.log(`[App] Server on post:${this.port} is start `);
        });
    }
    public close(): void{
        this.server.close()
    }
}
