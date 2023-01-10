import request from 'supertest';
import {app} from "../src/app";
import {jwtService} from "../src/utils/jwt-service";
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const blog1 = {
    name: 'blog1',
    description: "description1",
    websiteUrl: 'https://youtube1.com'
};

describe('Test comments & liking comments endpoint', () => {
    let blogId = '';
    let user1Id = '';
    let user2Id = '';
    let postId = '';
    let comment1Id=''
    let comment2Id=''
    let accessTokenUser1 = '';
    let accessTokenUser2 = '';
    let token_ = '';
    beforeAll(async () => {
        await mongoose.connect(mongoUri + '/' + dbName + '?retryWrites=true&w=majority');
        await request(app)
            .delete('/testing/all-data');
        //create new blog
        const newBlog = await request(app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                name: 'blog1',
                description: "description1",
                websiteUrl: 'https://youtube1.com'
            });
        blogId = newBlog.body.id;

        //create new post
        const newPost = await request(app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                title: 'post1',
                shortDescription: 'shortDescription1',
                content: 'content1',
                blogId: blogId
            });
        postId = newPost.body.id;

        //create user in DB
        const newUser1 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                login: "user1",
                password: "password1",
                email: "email1@gmail.com"
            });
        user1Id = newUser1.body.id;

        //create user in DB
        const newUser2 = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send({
                login: "user2",
                password: "password2",
                email: "email2@gmail.com"
            });
        user2Id = newUser2.body.id;

        //authorisation user1
        const auth1 = await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "password1"
            });

        accessTokenUser1 = auth1.body.accessToken;

        //authorisation user2
        const auth2 = await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user2",
                "password": "password2"
            });

        accessTokenUser2 = auth2.body.accessToken;



        //user1 creat two new comments
        const comment1 =await request(app)
            .post(`/posts/${postId}/comments`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .send({
                content: 'comment 1 comment 1 comment 1',
            });

        const comment2 =await request(app)
            .post(`/posts/${postId}/comments`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .send({
                content: 'comment 2 comment 2 comment 2',
            });
        comment1Id = comment1.body.id
        comment2Id = comment2.body.id


    });
    /* Closing database connection after each test. */
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('GET:/comments/{id} - should return code 404 if commentId is wrong', async () => {
        const comment = await request(app)
            .get(`/comments/63bbfbf52ea34ca5500f511c`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .expect(404);
    });

    it('GET:/comments/{id} - should return code 200 and body with comment', async () => {
        const comment = await request(app)
            .get(`/comments/${comment1Id}`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .expect(200);

        expect(comment.body).toEqual(
            {

                id: expect.any(String),
                content: "comment 1 comment 1 comment 1",
                userId: user1Id,
                userLogin: "user1",
                createdAt: expect.any(String),
                likesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: "None"
                }
            });
    });

    // PUT

    it('PUT:/comments/{id} - should return code 401 for unauthorized user', async () => {
        const commentChange = await request(app)
            .put(`/comments/${comment1Id}`)
            .send({"content": "change comment change comment"})
            .expect(401);
    });

    it('PUT:/comments/{id} - should return code 403 If try edit the comment that is not your own', async () => {
        const commentChange = await request(app)
            .put(`/comments/${comment1Id}`)
            .auth(accessTokenUser2, {type: 'bearer'})
            .send({"content": "change comment change comment"})
            .expect(403);
    });

    it('PUT:/comments/{id} - should return code 400 If the inputModel has incorrect values', async () => {
        const commentChange = await request(app)
            .put(`/comments/${comment1Id}`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .send({"content": "short"})
            .expect(400);
    });

    it('PUT:/comments/{id} - should return code 204', async () => {
        const commentChange = await request(app)
            .put(`/comments/${comment1Id}`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .send({"content": "change comment change comment"})
            .expect(204);
    });

    it('GET:/comments/{id} - should return code 200 and body with changed comment', async () => {
        const comment = await request(app)
            .get(`/comments/${comment1Id}`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .expect(200);

        expect(comment.body).toEqual(
            {
                id: expect.any(String),
                content: "change comment change comment",
                userId: user1Id,
                userLogin: "user1",
                createdAt: expect.any(String),
                likesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: "None"
                }
            });
    });

    //DELETE
    it('DELETE:/comments/{id} - should return code 401 for unauthorized user', async () => {
        const commentChange = await request(app)
            .delete(`/comments/${comment1Id}`)
            .send({"content": "change comment change comment"})
            .expect(401);
    });

    it('DELETE:/comments/{id} - should return code 403 If try edit the comment that is not your own', async () => {
        const commentChange = await request(app)
            .delete(`/comments/${comment1Id}`)
            .auth(accessTokenUser2, {type: 'bearer'})
            .send({"content": "change comment change comment"})
            .expect(403);
    });

    it('DELETE:/comments/{id} - should return code 204', async () => {
        const commentChange = await request(app)
            .delete(`/comments/${comment1Id}`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .send({"content": "change comment change comment"})
            .expect(204);
    });

    it('GET:/comments/{id} - should return code 404 for deleted comment', async () => {
        const comment = await request(app)
            .get(`/comments/${comment1Id}`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .expect(404);

    });

    //like

    it('PUT:/comments/{commentId}/like-status - should return code 400 If the inputModel has incorrect values', async () => {
        const commentChange = await request(app)
            .put(`/comments/${comment2Id}/like-status`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .send({"likeStatus": "not"})
            .expect(400);
    });

    it('PUT:/comments/{commentId}/like-status - SET LIKE USER1 for COMMENT2-  should return code 204', async () => {
        const commentChange = await request(app)
            .put(`/comments/${comment2Id}/like-status`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .send({"likeStatus": "Like"})
            .expect(204);
    });

    it('GET:/comments/{id} - should return code 200 and body with liked comment own user', async () => {
        const comment = await request(app)
            .get(`/comments/${comment2Id}`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .expect(200);

        expect(comment.body).toEqual(
            {
                id: expect.any(String),
                content: "comment 2 comment 2 comment 2",
                userId: user1Id,
                userLogin: "user1",
                createdAt: expect.any(String),
                likesInfo: {
                    dislikesCount: 0,
                    likesCount: 1,
                    myStatus: "Like"
                }
            });
    });

    it('GET:/comments/{id} - should return code 200 and body with liked comment & myStatus: "None" for other user', async () => {
        const comment = await request(app)
            .get(`/comments/${comment2Id}`)
            .auth(accessTokenUser2, {type: 'bearer'})
            .expect(200);

        expect(comment.body).toEqual(
            {
                id: expect.any(String),
                content: "comment 2 comment 2 comment 2",
                userId: user1Id,
                userLogin: "user1",
                createdAt: expect.any(String),
                likesInfo: {
                    dislikesCount: 0,
                    likesCount: 1,
                    myStatus: "None"
                }
            });
    });

    it('PUT:/comments/{commentId}/like-status - SET DISLIKE USER1 for COMMENT2-  should return code 204', async () => {
        const commentChange = await request(app)
            .put(`/comments/${comment2Id}/like-status`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .send({"likeStatus": "Dislike"})
            .expect(204);
    });

    it('GET:/comments/{id} - should return code 200 and body with disliked comment own user', async () => {
        const comment = await request(app)
            .get(`/comments/${comment2Id}`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .expect(200);

        expect(comment.body).toEqual(
            {
                id: expect.any(String),
                content: "comment 2 comment 2 comment 2",
                userId: user1Id,
                userLogin: "user1",
                createdAt: expect.any(String),
                likesInfo: {
                    dislikesCount: 1,
                    likesCount: 0,
                    myStatus: "Dislike"
                }
            });
    });

    it('GET:/comments/{id} - should return code 200 and body with disliked comment & myStatus: "None" for other user', async () => {
        const comment = await request(app)
            .get(`/comments/${comment2Id}`)
            .auth(accessTokenUser2, {type: 'bearer'})
            .expect(200);

        expect(comment.body).toEqual(
            {
                id: expect.any(String),
                content: "comment 2 comment 2 comment 2",
                userId: user1Id,
                userLogin: "user1",
                createdAt: expect.any(String),
                likesInfo: {
                    dislikesCount: 1,
                    likesCount: 0,
                    myStatus: "None"
                }
            });
    });

    it('PUT:/comments/{commentId}/like-status - CLEAR DISLIKE USER1 for COMMENT2-  should return code 204', async () => {
        const commentChange = await request(app)
            .put(`/comments/${comment2Id}/like-status`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .send({"likeStatus": "None"})
            .expect(204);
    });

    it('GET:/comments/{id} - should return code 200 and body without LIKE comment own user', async () => {
        const comment = await request(app)
            .get(`/comments/${comment2Id}`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .expect(200);

        expect(comment.body).toEqual(
            {
                id: expect.any(String),
                content: "comment 2 comment 2 comment 2",
                userId: user1Id,
                userLogin: "user1",
                createdAt: expect.any(String),
                likesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: "None"
                }
            });
    });

    it('GET:/comments/{id} - should return code 200 and body without LIKE comment & myStatus: "None" for other user', async () => {
        const comment = await request(app)
            .get(`/comments/${comment2Id}`)
            .auth(accessTokenUser1, {type: 'bearer'})
            .expect(200);

        expect(comment.body).toEqual(
            {
                id: expect.any(String),
                content: "comment 2 comment 2 comment 2",
                userId: user1Id,
                userLogin: "user1",
                createdAt: expect.any(String),
                likesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: "None"
                }
            });
    });
});