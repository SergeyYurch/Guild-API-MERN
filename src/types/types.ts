import {AuthControllerInterface} from '../controllers/interfaces/auth-controller.interface';
import {BlogsController} from '../controllers/blogs.controller';
import {CommentsController} from '../controllers/comments.controller';
import {PostsController} from '../controllers/posts.controller';
import {SecurityController} from '../controllers/security.controller';
import {TestingController} from '../controllers/testing.controller';
import {UserController} from '../controllers/users.controller';
import {UsersService} from '../services/users.service';
import {PostsService} from '../services/posts.service';
import {CommentsService} from '../services/comments.service';
import {BlogsService} from '../services/blogs.service';
import {AuthService} from '../services/auth.service';
import {QueryRepository} from '../repositories/query.repository';
import {UsersRepository} from '../repositories/users.repository';
import {TestsRepository} from '../repositories/tests.repository';
import {QueryCommentsRepository} from '../repositories/queryComments.repository';
import {PostsRepository} from '../repositories/posts.repository';
import {LikesRepository} from '../repositories/likes.repository';
import {CommentsRepository} from '../repositories/comments.repository';
import {BlogsRepository} from '../repositories/blogs.repository';
import {AuthSessionsRepository} from '../repositories/auth-sessions.repository';
import {AccessAttemptRepository} from '../repositories/access-attempt.repository';

const TYPES = {
    Application: Symbol.for('Application'),
    AuthController: Symbol.for("AuthController"),
    BlogsController: Symbol.for("BlogsController"),
    CommentsController: Symbol.for("CommentsController"),
    PostsController: Symbol.for("PostsController"),
    SecurityController: Symbol.for("SecurityController"),
    TestingController: Symbol.for("TestingController"),
    UserController: Symbol.for("UserController"),

    UsersService: Symbol.for("UsersService"),
    PostsService: Symbol.for("PostsService"),
    CommentsService: Symbol.for("CommentsService"),
    BlogsService: Symbol.for("BlogsService"),
    AuthService: Symbol.for("AuthService"),

    QueryRepository: Symbol.for("QueryRepository"),
    UsersRepository: Symbol.for("UsersRepository"),
    TestsRepository: Symbol.for("TestsRepository"),
    QueryCommentsRepository: Symbol.for("QueryCommentsRepository"),
    PostsRepository: Symbol.for("PostsRepository"),
    LikesRepository: Symbol.for("LikesRepository"),
    CommentsRepository: Symbol.for("CommentsRepository"),
    BlogsRepository: Symbol.for("BlogsRepository"),
    AuthSessionsRepository: Symbol.for("AuthSessionsRepository"),
    AccessAttemptRepository: Symbol.for("AccessAttemptRepository"),
};









export { TYPES };