import {AccessAttemptRepository} from '../repositories/access-attempt.repository';
import {AuthSessionsRepository} from '../repositories/auth-sessions.repository';
import {BlogsRepository} from '../repositories/blogs.repository';
import {CommentsRepository} from '../repositories/comments.repository';
import {LikesRepository} from '../repositories/likes.repository';
import {PostsRepository} from '../repositories/posts.repository';
import {QueryRepository} from '../repositories/query.repository';
import {QueryCommentsRepository} from '../repositories/queryComments.repository';
import {TestsRepository} from '../repositories/tests.repository';
import {UsersRepository} from '../repositories/users.repository';
import {AuthService} from '../services/auth.service';
import {BlogsService} from '../services/blogs.service';
import {CommentsService} from '../services/comments.service';
import {PostsService} from '../services/posts.service';
import {UsersService} from '../services/users.service';
import {AuthController} from '../controllers/auth.controller';
import {BlogsController} from '../controllers/blogs.controller';
import {CommentsController} from '../controllers/comments.controller';
import {PostsController} from '../controllers/posts.controller';
import {SecurityController} from '../controllers/security.controller';
import {TestingController} from '../controllers/testing.controller';
import {UserController} from '../controllers/users.controller';

export const accessAttemptRepository = new AccessAttemptRepository();
const authSessionsRepository = new AuthSessionsRepository();
const blogsRepository = new BlogsRepository();
const commentsRepository = new CommentsRepository();
const likesRepository = new LikesRepository();
const postsRepository = new PostsRepository();
const queryCommentsRepository = new QueryCommentsRepository();
const testsRepository = new TestsRepository();
const usersRepository = new UsersRepository();
export const queryRepository = new QueryRepository(usersRepository);


export const authService = new AuthService(usersRepository, queryRepository, authSessionsRepository);
const blogsService = new BlogsService(blogsRepository, queryRepository);
const commentsService = new CommentsService(queryRepository, commentsRepository, likesRepository);
const postsService = new PostsService(postsRepository, queryRepository);
export const usersService = new UsersService(usersRepository, queryRepository);

export const authController = new AuthController(usersService, authService);
export const blogsController = new BlogsController(blogsService, queryRepository, postsService);
export const commentsController = new CommentsController(queryRepository, usersService, commentsService, queryCommentsRepository);
export const postsController = new PostsController(queryRepository, queryCommentsRepository, usersService, commentsService, postsService);
export const securityController = new SecurityController(authService);
export const testingController = new TestingController(testsRepository);
export const userController = new UserController(usersService, queryRepository);

