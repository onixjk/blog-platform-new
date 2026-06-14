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
                .post('/auth/login')
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
                .get('/auth/me') // 👈 Чистый и правильный одинарный путь
                .set('Authorization', `Bearer ${jwtToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('userId');
        });

        it('GET /auth/me -> Ошибка 401 при отсутствии токена', async () => {
            const res = await request
                .get('/auth/me'); // 👈 И здесь тоже одинарный путь

            expect(res.statusCode).toBe(401);
        });
    });

    // =========================================================================
    // НОВЫЕ ТЕСТЫ: AUTH REFRESH & LOGOUT FLOW (СОГЛАСНО ОБНОВЛЕННОМУ SWAGGER)
    // =========================================================================
    describe('Auth Token Lifecycle (Refresh & Logout via Cookies)', () => {
        // Локальный массив для хранения куки в рамках этого блока тестов
        let localCookies: any[] = [];
        // Локальная переменная для токена, чтобы TS гарантированно её видел
        let localJwtToken: string = '';

        // Вспомогательная функция с явной типизацией `: any`, чтобы убрать ошибку TS7006
        const getRefreshTokenFromCookie = (res: any): string | null => {
            const setCookieHeaders = res.headers['set-cookie'];
            if (!setCookieHeaders) return null;

            const refreshCookie = setCookieHeaders.find((cookie: string) => cookie.startsWith('refreshToken='));
            if (!refreshCookie) return null;

            // [0] гарантирует, что мы берем только 'refreshToken=значение_токена'
            return refreshCookie.split(';')[0];
        };

        it('POST /auth/login -> Перехват и проверка http-only куки refreshToken', async () => {
            const res: any = await request
                .post('/auth/login')
                .send({
                    loginOrEmail: userCredentials.login,
                    password: userCredentials.password
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');

            const refreshTokenCookie = getRefreshTokenFromCookie(res);
            expect(refreshTokenCookie).not.toBeNull();

            // Теперь это строка, и проверка подстроки сработает идеально
            expect(refreshTokenCookie).toContain('refreshToken=');

            // Сохраняем чистую строку куки для supertest
            localJwtToken = res.body.accessToken;
            localCookies = [refreshTokenCookie!];

            try { jwtToken = res.body.accessToken; } catch (e) {}
        });

        it('POST /auth/refresh-token -> Ошибка 401, если кука refreshToken отсутствует', async () => {
            const res: any = await request
                .post('/auth/refresh-token')
                .set('Cookie', []);

            expect(res.statusCode).toBe(401);
        });

        it('POST /auth/refresh-token -> Ошибка 401 при отправке невалидной или измененной куки', async () => {
            const res: any = await request
                .post('/auth/refresh-token')
                .set('Cookie', ['refreshToken=invalid_token_string_here']);

            expect(res.statusCode).toBe(401);
        });

        it('POST /auth/refresh-token -> Успешный выпуск новой пары токенов (200)', async () => {
            const res: any = await request
                .post('/auth/refresh-token')
                .set('Cookie', localCookies);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');

            const newCookie = getRefreshTokenFromCookie(res);
            expect(newCookie).not.toBeNull();

            // Перезаписываем переменные актуальными значениями
            localJwtToken = res.body.accessToken;
            localCookies = [newCookie];

            try { jwtToken = res.body.accessToken; } catch (e) { /* синхронизируем с глобальной переменной */ }
        });

        it('POST /auth/logout -> Ошибка 401 при попытке выхода без куки', async () => {
            const res: any = await request
                .post('/auth/logout')
                .set('Cookie', []);

            expect(res.statusCode).toBe(401);
        });

        it('POST /auth/logout -> Успешный выход из системы и отзыв токена (204)', async () => {
            const res: any = await request
                .post('/auth/logout')
                .set('Cookie', localCookies);

            expect(res.statusCode).toBe(204);
            expect(res.body).toEqual({});
        });

        it('POST /auth/refresh-token -> Ошибка 401 после logout (токен успешно отозван базой)', async () => {
            const res: any = await request
                .post('/auth/refresh-token')
                .set('Cookie', localCookies); // Кука использована повторно после выхода

            expect(res.statusCode).toBe(401);
        });

        it('Восстановление сессии для последующих блоков (Comments / Cleanup)', async () => {
            const res: any = await request
                .post('/auth/login')
                .send({
                    loginOrEmail: userCredentials.login,
                    password: userCredentials.password
                });

            expect(res.statusCode).toBe(200);
            try { jwtToken = res.body.accessToken; } catch (e) { /* восстанавливаем токен для старых тестов */ }
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
        });
    });
});


// ==========================================
// ДОПОЛНЕНИЕ ДЛЯ КОНТРОЛЛЕРА: AUTH OPERATIONS (Регистрация и подтверждение)
// ==========================================
describe('Registration & Confirmation Flow', () => {
    const newUserCredentials = {
        login: 'newtester',
        password: 'securepassword123',
        email: 'newtester@example.com'
    };

    const invalidConfirmationCode = 'invalid-code-12345';

    it('POST /auth/registration -> Ошибка 400 при некорректных входных данных', async () => {
        const res = await request
            .post('/auth/registration')
            .send({ login: '', password: '1', email: 'wrong-email-format' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(Array.isArray(res.body.errorsMessages)).toBe(true);
        expect(res.body.errorsMessages[0]).toEqual(expect.objectContaining({
            message: expect.any(String),
            field: expect.any(String)
        }));
    });

    it('POST /auth/registration -> Успешная регистрация нового пользователя (204)', async () => {
        const res = await request
            .post('/auth/registration')
            .send(newUserCredentials);

        expect(res.statusCode).toBe(204);
        expect(res.body).toEqual({});
    });

    // it('POST /auth/registration-confirmation -> Успешная активация аккаунта по коду из БД (204)', async () => {
    //     // 1. Берем email пользователя, которого мы только что зарегистрировали в тесте выше
    //     const registeredEmail = newUserCredentials.email;
    //
    //     // 2. Идем напрямую в коллекцию пользователей в БД и ищем запись
    //     // (Замените usersCollection и структуру полей на те, что используются в вашем проекте)
    //     const userInDb: any = await userCollection.findOne({ email: registeredEmail });
    //
    //     expect(userInDb).not.toBeNull();
    //     // Обычно код подтверждения хранится в объекте типа confirmationCode или emailConfirmation
    //     const realConfirmationCode = userInDb.emailConfirmation?.confirmationCode;
    //
    //     expect(realConfirmationCode).toBeDefined();
    //
    //     // 3. Отправляем реальный код на эндпоинт подтверждения
    //     const res: any = await request
    //         .post('/auth/registration-confirmation')
    //         .send({ code: realConfirmationCode });
    //
    //     // 4. Теперь сервер обязан вернуть 204 No Content, так как код валидный
    //     expect(res.statusCode).toBe(204);
    // });

    it('POST /auth/registration -> Ошибка 400, если пользователь с таким логином или email уже существует', async () => {
        const res = await request
            .post('/auth/registration')
            .send(newUserCredentials); // Повторная отправка тех же данных

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errorsMessages');
    });

    it('POST /auth/registration-confirmation -> Ошибка 400 при отправке некорректного или истекшего кода', async () => {
        const res = await request
            .post('/auth/registration-confirmation')
            .send({ code: invalidConfirmationCode });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(Array.isArray(res.body.errorsMessages)).toBe(true);
    });

    it('POST /auth/registration-email-resending -> Ошибка 400 при отправке некорректного формата email', async () => {
        const res = await request
            .post('/auth/registration-email-resending')
            .send({ email: 'not-an-email' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errorsMessages');
    });

    it('POST /auth/registration-email-resending -> Успешное переотправление кода на валидный неподтвержденный email (204)', async () => {
        const res = await request
            .post('/auth/registration-email-resending')
            .send({ email: newUserCredentials.email });

        expect(res.statusCode).toBe(204);
        expect(res.body).toEqual({});
    });

    // 💡 Примечание: Для полноценного тестирования успешного подтверждения (204) на реальной базе
    // обычно перехватывают отправленное письмо (например, через Mock-сервис почты или обращаются напрямую в БД/репозиторий),
    // достают из него реальный code и передают его в POST /auth/registration-confirmation.
});


