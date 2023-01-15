import 'reflect-metadata';
import {Container, ContainerModule, interfaces} from 'inversify';
import {App} from './app';
import {TYPES} from './types/types';
import {AuthControllerInterface} from './controllers/interfaces/auth-controller.interface';
import {AuthController} from './controllers/auth.controller';
import {BlogsController} from './controllers/blogs.controller';
import {CommentsController} from './controllers/comments.controller';
import {PostsController} from './controllers/posts.controller';
import {SecurityController} from './controllers/security.controller';
import {TestingController} from './controllers/testing.controller';
import {UserController} from './controllers/users.controller';
import {AuthService} from './services/auth.service';
import {UsersService} from './services/users.service';
import {PostsService} from './services/posts.service';
import {CommentsService} from './services/comments.service';
import {BlogsService} from './services/blogs.service';
import {QueryRepository} from './repositories/query.repository';
import {UsersRepository} from './repositories/users.repository';
import {TestsRepository} from './repositories/tests.repository';
import {QueryCommentsRepository} from './repositories/queryComments.repository';
import {PostsRepository} from './repositories/posts.repository';
import {LikesRepository} from './repositories/likes.repository';
import {CommentsRepository} from './repositories/comments.repository';
import {BlogsRepository} from './repositories/blogs.repository';
import {AuthSessionsRepository} from './repositories/auth-sessions.repository';
import {AccessAttemptRepository} from './repositories/access-attempt.repository';

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {

    bind(TYPES.Application).to(App);

    bind<AuthControllerInterface>(TYPES.AuthController).to(AuthController);
    bind(TYPES.BlogsController).to(BlogsController);
    bind(TYPES.CommentsController).to(CommentsController);
    bind(TYPES.PostsController).to(PostsController);
    bind(TYPES.SecurityController).to(SecurityController);
    bind(TYPES.TestingController).to(TestingController);
    bind(TYPES.UserController).to(UserController);

    bind(TYPES.AuthService).to(AuthService);
    bind(TYPES.UsersService).to(UsersService);
    bind(TYPES.PostsService).to(PostsService);
    bind(TYPES.CommentsService).to(CommentsService);
    bind(TYPES.BlogsService).to(BlogsService);

    bind(TYPES.QueryRepository).to(QueryRepository);
    bind(TYPES.UsersRepository).to(UsersRepository);
    bind(TYPES.TestsRepository).to(TestsRepository);
    bind(TYPES.QueryCommentsRepository).to(QueryCommentsRepository);
    bind(TYPES.PostsRepository).to(PostsRepository);
    bind(TYPES.LikesRepository).to(LikesRepository);
    bind(TYPES.CommentsRepository).to(CommentsRepository);
    bind(TYPES.BlogsRepository).to(BlogsRepository);
    bind(TYPES.AuthSessionsRepository).to(AuthSessionsRepository);
    bind(TYPES.AccessAttemptRepository).to(AccessAttemptRepository);
});

async function bootstrap() {
    try {
        const appContainer = new Container();
        appContainer.load(appBindings);
        const app = appContainer.get<App>(TYPES.Application);
        await app.init()
        return {app, appContainer};
    } catch (err) {
        console.error(err);
        process.exit();
    }
}

export const applicationBoot = bootstrap();

