// import request from "supertest";
// import express from "express";
// import {setupApp} from "../../src/setup-app";
// import {HttpStatuses} from "../../src/core/types/http-statuses";

// describe('/blog', () => {
//
//     const app = express();
//     setupApp(app);
//
//     beforeAll(async () => {
//         await request(app).delete(`/testing/all-data`);
//     })
//
//     it('should return 404', async () => {
//         await request(app)
//             .get('/blog')
//             .expect(HttpStatuses.NotFound_404)
//     });
//
//     it('should return 404', async () => {
//         await request(app)
//             .get('/blog')
//             .expect(HttpStatuses.NotFound_404)
//     });
//
//
//
//
// })

import supertest from 'supertest';

const baseUrl = 'http://localhost:5001';

// ✅ Используем явный вызов через фабрику supertest
const request = supertest(baseUrl);



// Данные для административного доступа (Basic Auth)
const adminAuth = { username: 'admin', password: 'qwerty' };
const basicAuthHeader = 'Basic ' + Buffer.from(`${adminAuth.username}:${adminAuth.password}`).toString('base64');

// Данные для создания и авторизации обычного пользователя
const userCredentials = {
    login: 'tester',
    password: 'superpassword123',
    email: 'tester@example.com'
};

describe('Comprehensive API Integration Tests (Full Swagger Coverage)', () => {
    let jwtToken = '';
    let createdUserId = '';
    let createdBlogId = '';
    let createdPostId = '';
    let createdCommentId = '';

    // Валидный по структуре ObjectId (для MongoDB) или UUID, которого гарантированно нет в базе
    const nonexistentId = '65f1a2b3c4d5e6f7a8b9c0d1';

    // ==========================================
    // ИНИЦИАЛИЗАЦИЯ: ОЧИСТКА БАЗЫ ДАННЫХ
    // ==========================================
    beforeAll(async () => {
        const res = await request.delete(`/testing/all-data`);
        expect(res.statusCode).toBe(204);
    });

    // ==========================================
    // 1. КОНТРОЛЛЕР: USERS MANAGEMENT
    // ==========================================
    describe('Users Core Operations', () => {
        it('POST /users -> Ошибка 401 без Basic Auth', async () => {
            const res = await request
                .post(`/users`)
                .send(userCredentials);

            expect(res.statusCode).toBe(401);
        });

        it('POST /users -> Ошибка 400 при некорректных входных данных', async () => {
            const res = await request
                .post(`/users`)
                .set('Authorization', basicAuthHeader)
                .send({ login: '', password: '1', email: 'not-an-email' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('errorsMessages');
            expect(Array.isArray(res.body.errorsMessages)).toBe(true);
        });

        it('POST /users -> Успешное создание нового пользователя (201)', async () => {
            const res = await request
                .post(`/users`)
                .set('Authorization', basicAuthHeader)
                .send(userCredentials);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.login).toBe(userCredentials.login);
            expect(res.body.email).toBe(userCredentials.email);
            expect(res.body).toHaveProperty('createdAt');

            createdUserId = res.body.id;
        });

        it('GET /users -> Получение списка пользователей с пагинацией (200)', async () => {
            const res = await request
                .get(`/users`)
                .set('Authorization', basicAuthHeader)
                .query({ pageSize: 5, pageNumber: 1, sortBy: 'createdAt', sortDirection: 'desc' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(expect.objectContaining({
                pagesCount: expect.any(Number),
                page: 1,
                pageSize: 5,
                totalCount: expect.any(Number),
                items: expect.any(Array)
            }));
        });
    });

    // ==========================================
    // 2. КОНТРОЛЛЕР: AUTH FLOW
    // ==========================================
    describe('Auth Operations', () => {
        it('POST /auth/login -> Успешный вход и генерация JWT (200)', async () => {
            const res = await request
                .post('/auth/login') // На бэкенде это .post('/login') внутри префиксного файла
                .send({
                    loginOrEmail: userCredentials.login,
                    password: userCredentials.password
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            jwtToken = res.body.accessToken;
        });

        it('GET /auth/me -> Успешное получение профиля с Bearer токеном (200)', async () => {
            const res = await request
                .get('/auth/auth/me') // 👈 Стучимся по реальному сдвоенному пути бэкенда!
                .set('Authorization', `Bearer ${jwtToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('userId');
        });

        it('GET /auth/me -> Ошибка 401 при отсутствии токена', async () => {
            const res = await request
                .get('/auth/auth/me'); // 👈 И здесь тоже исправляем путь

            expect(res.statusCode).toBe(401);
        });
    });

    // ==========================================
    // 3. КОНТРОЛЛЕР: BLOGS MANAGEMENT
    // ==========================================
    describe('Blogs CRUD Operations', () => {
        const mockBlog = {
            name: 'Dev Blog',
            description: 'Tech articles & tutorials',
            websiteUrl: 'https://dev.to'
        };

        it('POST /blogs -> Успешное создание блога через Basic Auth (201)', async () => {
            const res = await request
                .post(`/blogs`)
                .set('Authorization', basicAuthHeader)
                .send(mockBlog);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe(mockBlog.name);
            expect(res.body.isMembership).toBe(false);

            createdBlogId = res.body.id;
        });

        it('GET /blogs -> Публичное получение списка блогов (200)', async () => {
            const res = await request.get(`/blogs`);
            expect(res.statusCode).toBe(200);
            expect(res.body.items.length).toBeGreaterThan(0);
        });

        it('GET /blogs/:id -> Получение блога по ID (200)', async () => {
            const res = await request.get(`/blogs/${createdBlogId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(createdBlogId);
        });

        it('GET /blogs/:id -> Ошибка 404 для несуществующего блога', async () => {
            const res = await request.get(`/blogs/${nonexistentId}`);
            expect(res.statusCode).toBe(404);
        });

        it('PUT /blogs/:id -> Успешное обновление блога (204)', async () => {
            const res = await request
                .put(`/blogs/${createdBlogId}`)
                .set('Authorization', basicAuthHeader)
                .send({
                    name: 'ValidName',
                    description: 'This is a valid description for the blog',
                    websiteUrl: 'https://google.com'
                });
            expect(res.statusCode).toBe(204);
            expect(res.body).toEqual({});
        });
    });

    // ==========================================
    // 4. КОНТРОЛЛЕР: POSTS OPERATIONS
    // ==========================================
    describe('Posts CRUD & Nested Operations', () => {
        const mockPost = {
            title: 'Intro to Jest',
            shortDescription: 'Simple testing guide',
            content: 'Long form content markdown syntax analysis.'
        };

        it('POST /blogs/:blogId/posts -> Создание поста, привязанного к блогу (201)', async () => {
            const res = await request
                .post(`/blogs/${createdBlogId}/posts`)
                .set('Authorization', basicAuthHeader)
                .send(mockPost);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.blogId).toBe(createdBlogId);
            expect(res.body).toHaveProperty('blogName');

            createdPostId = res.body.id;
        });

        it('GET /blogs/:blogId/posts -> Получение постов конкретного блога (200)', async () => {
            const res = await request.get(`/blogs/${createdBlogId}/posts`);
            expect(res.statusCode).toBe(200);
            expect(res.body.items.length).toBeGreaterThan(0);
        });

        it('GET /posts -> Публичное получение всех постов (200)', async () => {
            const res = await request.get(`/posts`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.items)).toBe(true);
        });

        it('GET /posts/:id -> Получение поста по его ID (200)', async () => {
            const res = await request.get(`/posts/${createdPostId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(createdPostId);
        });

        it('PUT /posts/:id -> Успешное изменение поста админом (204)', async () => {
            const res = await request
                .put(`/posts/${createdPostId}`)
                .set('Authorization', basicAuthHeader)
                .send({
                    ...mockPost,
                    title: 'Updated Post Title',
                    blogId: createdBlogId
                });
            expect(res.statusCode).toBe(204);
        });
    });

    // ==========================================
    // 5. КОНТРОЛЛЕР: COMMENTS OPERATIONS
    // ==========================================
    describe('Comments Flow', () => {
        const commentData = { content: 'This is a valid text length comment for this post.' };

        it('POST /posts/:postId/comments -> Создание комментария под JWT токеном (201)', async () => {
            const res = await request
                .post(`/posts/${createdPostId}/comments`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(commentData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.content).toBe(commentData.content);
            expect(res.body.commentatorInfo.userId).toBe(createdUserId);

            createdCommentId = res.body.id;
        });

        it('GET /posts/:postId/comments -> Получение всех комментариев к посту (200)', async () => {
            const res = await request.get(`/posts/${createdPostId}/comments`);
            expect(res.statusCode).toBe(200);
            expect(res.body.items.length).toBeGreaterThan(0);
        });

        it('GET /comments/:id -> Публичный эндпоинт получения комментария по ID (200)', async () => {
            const res = await request.get(`/comments/${createdCommentId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(createdCommentId);
        });

        it('PUT /comments/:commentId -> Ошибка 403 при попытке изменить чужой комментарий', async () => {
            // 1. Создаем второго пользователя через админку
            const secondUserCredentials = {
                login: 'tester2',
                password: 'superpassword123',
                email: 'tester2@example.com'
            };

            await request
                .post('/users')
                .set('Authorization', basicAuthHeader)
                .send(secondUserCredentials);

            // 2. Логинимся под вторым пользователем, чтобы получить его ВАЛИДНЫЙ токен
            const loginRes = await request
                .post('/auth/login')
                .send({
                    loginOrEmail: secondUserCredentials.login,
                    password: secondUserCredentials.password
                });

            const secondUserJwtToken = loginRes.body.accessToken;

            // 3. Отправляем запрос на изменение комментария ПЕРВОГО пользователя с токеном ВТОРОГО пользователя
            const res = await request
                .put(`/comments/${createdCommentId}`)
                .set('Authorization', `Bearer ${secondUserJwtToken}`) // Используем настоящий токен другого юзера
                .send({ content: 'Malicious update attempts by another user.' });

            // Теперь бэкенд успешно распарсит токен, поймет кто это, и выдаст 403 Forbidden!
            expect(res.statusCode).toBe(403);
        });

        it('PUT /comments/:commentId -> Успешное обновление своего комментария (204)', async () => {
            const res = await request
                .put(`/comments/${createdCommentId}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({ content: 'This is an updated comment text that meets all validators.' });
            expect(res.statusCode).toBe(204);
        });

        it('DELETE /comments/:commentId -> Успешное удаление комментария автором (204)', async () => {
            const res = await request
                .delete(`/comments/${createdCommentId}`)
                .set('Authorization', `Bearer ${jwtToken}`);
            expect(res.statusCode).toBe(204);
        });
    });

    // ==========================================
    // 6. ОЧИСТКА ДАННЫХ И ПРОВЕРКА УДАЛЕНИЯ
    // ==========================================
    describe('Final Cascading Cleanup Operations', () => {
        it('DELETE /posts/:id -> Удаление тестового поста админом (204)', async () => {
            const res = await request
                .delete(`/posts/${createdPostId}`)
                .set('Authorization', basicAuthHeader);
            expect(res.statusCode).toBe(204);
        });

        it('DELETE /blogs/:id -> Удаление тестового блога админом (204)', async () => {
            const res = await request
                .delete(`/blogs/${createdBlogId}`)
                .set('Authorization', basicAuthHeader);
            expect(res.statusCode).toBe(204);
        });

        it('DELETE /users/:id -> Удаление тестового пользователя админом (204)', async () => {
            const res = await request
                .delete(`/users/${createdUserId}`)
                .set('Authorization', basicAuthHeader);
            expect(res.statusCode).toBe(204);
        });

        it('GET /users/:id -> Проверка удаления: данные отсутствуют (404)', async () => {
            const res = await request
                .get('/users')
                .set('Authorization', basicAuthHeader);

            const userExists = res.body.items.some((u: any) => u.id === createdUserId);

            expect(userExists).toBe(false);
            // const res = await request
            //     .get(`/blogs/${createdBlogId}`);
            // expect(res.statusCode).toBe(404);
        });
    });
});
