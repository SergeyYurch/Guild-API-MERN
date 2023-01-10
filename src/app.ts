import express from 'express';
import cookieParser from 'cookie-parser'
import cors from 'cors'

import {blogsRouter} from './routes/blogs.route';
import {postsRouter} from './routes/posts.route';
import {testingRouter} from './routes/testing.route';
import {authRouter} from './routes/auth.route';
import {usersRouter} from './routes/users.route';
import {securityRouter} from './routes/security.route';
import {commentsRouter} from './routes/comments.route';

export const app = express();
app.set('trust proxy', true)
app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/testing', testingRouter)
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/comments', commentsRouter)
app.use('/security', securityRouter)


