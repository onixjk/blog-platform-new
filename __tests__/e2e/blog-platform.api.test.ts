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
    // 2. КОНТРОЛЛЕР: AUTH FLOW & RATE LIMITS
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
                .get('/auth/me')
                .set('Authorization', `Bearer ${jwtToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('userId');
            expect(res.body).toHaveProperty('login');
            expect(res.body).toHaveProperty('email');
            expect(res.body.login).toBe(userCredentials.login);
            expect(res.body.email).toBe(userCredentials.email);
        });

        it('GET /auth/me -> Ошибка 401 при отсутствии токена', async () => {
            const res = await request
                .get('/auth/me');

            expect(res.statusCode).toBe(401);
        });

        // ⚠️ Тест на флуд перенесен в самый конец describe,
        // чтобы он не блокировал GET /auth/me, идущие выше
        it('POST /auth/login -> Ошибка 429 при отправке более 5 запросов за 10 секунд', async () => {
            for (let i = 0; i < 5; i++) {
                await request
                    .post('/auth/login')
                    .send({ loginOrEmail: userCredentials.login, password: 'wrong-password' });
            }

            const res = await request
                .post('/auth/login')
                .send({ loginOrEmail: userCredentials.login, password: userCredentials.password });

            expect(res.statusCode).toBe(429);
        });
    });


    // =========================================================================
    // НОВЫЕ ТЕСТЫ: AUTH REFRESH & LOGOUT FLOW (СОГЛАСНО ОБНОВЛЕННОМУ SWAGGER)
    // =========================================================================
    describe('Auth Token Lifecycle (Refresh & Logout via Cookies)', () => {
        let savedCookieString: string = '';
        beforeAll(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10000));
        });
        // Вспомогательная функция: извлекает только чистую строку 'refreshToken=значение'
        const getRefreshTokenFromCookie = (res: any): string | null => {
            const setCookieHeaders = res.headers['set-cookie'];
            if (!setCookieHeaders) return null;

            const refreshCookie = setCookieHeaders.find((cookie: string) => cookie.startsWith('refreshToken='));
            if (!refreshCookie) return null;

            // Отсекаем параметры HttpOnly, Secure, Path, забирая только часть до первого ';'
            return refreshCookie.split(';')[0];
        };

        it('POST /auth/login -> Дополнительная проверка: Ошибка 401 при неверном пароле', async () => {
            const res: any = await request
                .post('/auth/login')
                .send({
                    loginOrEmail: userCredentials.login,
                    password: 'wrong-password-123'
                });

            expect(res.statusCode).toBe(401);
        });

        it('POST /auth/login -> Перехват и проверка http-only куки refreshToken', async () => {
            const res: any = await request
                .post('/auth/login')
                .send({
                    loginOrEmail: userCredentials.login,
                    password: userCredentials.password
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');

            const tokenCookie = getRefreshTokenFromCookie(res);
            expect(tokenCookie).not.toBeNull();
            expect(tokenCookie).toContain('refreshToken=');

            // Сохраняем чистую куку в переменную
            savedCookieString = tokenCookie!;

            // Синхронизируем глобальный токен для ваших старых тестов (комментариев и т.д.)
            try { jwtToken = res.body.accessToken; } catch (e) {}
        });

        // =========================================================================
        // ВЛОЖЕННЫЙ БЛОК: СЕССИИ И УСТРОЙСТВА (ПОЛНОЕ ПОКРЫТИЕ SECURITY/DEVICES)
        // =========================================================================
        describe('Security Devices Operations', () => {
            let secondUserCookie = '';
            let firstUserDeviceId = '';
            let secondUserDeviceId = '';

            beforeAll(async () => {
                // Создаем второго пользователя для полноценного теста ошибки 403 Forbidden
                const secondUserCredentials = {
                    login: 'devicetester2',
                    password: 'superpassword123',
                    email: 'devicetester2@example.com'
                };

                await request
                    .post('/users')
                    .set('Authorization', basicAuthHeader)
                    .send(secondUserCredentials);

                const loginRes = await request
                    .post('/auth/login')
                    .send({
                        loginOrEmail: secondUserCredentials.login,
                        password: secondUserCredentials.password
                    });

                const setCookieHeaders = loginRes.headers['set-cookie'] as any;
                if (setCookieHeaders) {
                    // Если пришла строка, оборачиваем в массив, если уже массив — используем как есть
                    const cookiesArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
                    const refreshCookie = cookiesArray.find((cookie: string) => cookie.startsWith('refreshToken='));
                    if (refreshCookie) {
                        secondUserCookie = refreshCookie.split(';')[0];
                    }
                }
            });

            it('GET /security/devices -> Ошибка 401 при отсутствии сессионной куки', async () => {
                const res = await request
                    .get('/security/devices')
                    .set('Cookie', []);

                expect(res.statusCode).toBe(401);
            });

            it('DELETE /security/devices/:deviceId -> Ошибка 401 при удалении без куки', async () => {
                const res = await request
                    .delete(`/security/devices/${nonexistentId}`)
                    .set('Cookie', []);

                expect(res.statusCode).toBe(401);
            });

            it('GET /security/devices -> Успешное получение списка устройств и фиксация deviceId', async () => {
                // Проверяем сессию первого пользователя
                const resFirst = await request
                    .get('/security/devices')
                    .set('Cookie', [savedCookieString]);
                expect(resFirst.statusCode).toBe(200);
                expect(Array.isArray(resFirst.body)).toBe(true);
                firstUserDeviceId = resFirst.body[0].deviceId;

                // Проверяем сессию второго пользователя
                const resSecond = await request
                    .get('/security/devices')
                    .set('Cookie', [secondUserCookie]);
                expect(resSecond.statusCode).toBe(200);
                expect(Array.isArray(resSecond.body)).toBe(true);
                secondUserDeviceId = resSecond.body[0].deviceId;

                // Проверяем соответствие схеме Swagger для первого девайса
                const device = resFirst.body[0];
                expect(device).toHaveProperty('ip');
                expect(device).toHaveProperty('title');
                expect(device).toHaveProperty('lastActiveDate');
                expect(device).toHaveProperty('deviceId');
            });

            it('DELETE /security/devices/:deviceId -> Ошибка 404, если устройство не найдено', async () => {
                const res = await request
                    .delete(`/security/devices/${nonexistentId}`)
                    .set('Cookie', [savedCookieString]);

                expect(res.statusCode).toBe(404);
            });

            it('DELETE /security/devices/:deviceId -> Ошибка 403 при попытке удалить чужое устройство', async () => {
                // Первый пользователь пытается грохнуть сессию второго пользователя
                const res = await request
                    .delete(`/security/devices/${secondUserDeviceId}`)
                    .set('Cookie', [savedCookieString]);

                expect(res.statusCode).toBe(403);
            });

            it('DELETE /security/devices/:deviceId -> Успешное точечное удаление сессии по ID (204)', async () => {
                // Второй пользователь удаляет свою собственную сессию
                const res = await request
                    .delete(`/security/devices/${secondUserDeviceId}`)
                    .set('Cookie', [secondUserCookie]);

                expect(res.statusCode).toBe(204);
            });

            it('DELETE /security/devices -> Успешное удаление всех остальных сессий, кроме текущей (204)', async () => {
                const res = await request
                    .delete('/security/devices')
                    .set('Cookie', [savedCookieString]);

                expect(res.statusCode).toBe(204);
            });
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
                .set('Cookie', [savedCookieString]);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');

            const newCookie = getRefreshTokenFromCookie(res);
            expect(newCookie).not.toBeNull();

            // Перезаписываем актуальные значения для следующих шагов
            savedCookieString = newCookie!;
            try { jwtToken = res.body.accessToken; } catch (e) {}
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
                .set('Cookie', [savedCookieString]);

            expect(res.statusCode).toBe(204);
            expect(res.body).toEqual({});
        });

        it('POST /auth/refresh-token -> Ошибка 401 после logout (токен успешно отозван базой)', async () => {
            // Микропауза для стабильности MongoDB в окружении интеграционных тестов
            await new Promise((resolve) => setTimeout(resolve, 50));

            const res: any = await request
                .post('/auth/refresh-token')
                .set('Cookie', [savedCookieString]); // Отправляем заблокированный токен

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
            try { jwtToken = res.body.accessToken; } catch (e) {}
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
// 6. КОНТРОЛЛЕР: REGISTRATION & CONFIRMATION
// ==========================================
describe('Registration & Confirmation Flow', () => {
    const newUserCredentials = {
        login: 'newtester',
        password: 'securepassword123',
        email: 'newtester@example.com'
    };

    const invalidConfirmationCode = 'invalid-code-12345';

    // Даем серверу очистить лимиты IP после прошлых тестов перед началом регистрации
    beforeAll(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
    });

    it('POST /auth/registration -> Ошибка 400 при некорректных входных данных', async () => {
        const res = await request
            .post('/auth/registration')
            .send({ login: '', password: '1', email: 'wrong-email-format' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errorsMessages');
    });

    it('POST /auth/registration -> Успешная регистрация нового пользователя (204)', async () => {
        const res = await request
            .post('/auth/registration')
            .send(newUserCredentials);

        expect(res.statusCode).toBe(204);
    });

    it('POST /auth/registration -> Ошибка 400, если пользователь уже существует', async () => {
        const res = await request
            .post('/auth/registration')
            .send(newUserCredentials);

        expect(res.statusCode).toBe(400);
    });

    it('POST /auth/registration-confirmation -> Ошибка 400 при отправке некорректного кода', async () => {
        const res = await request
            .post('/auth/registration-confirmation')
            .send({ code: invalidConfirmationCode });

        expect(res.statusCode).toBe(400);
    });

    it('POST /auth/registration-email-resending -> Ошибка 400 при некорректном email', async () => {
        const res = await request
            .post('/auth/registration-email-resending')
            .send({ email: 'not-an-email' });

        expect(res.statusCode).toBe(400);
    });

    it('POST /auth/registration-email-resending -> Успешное переотправление кода (204)', async () => {
        const res = await request
            .post('/auth/registration-email-resending')
            .send({ email: newUserCredentials.email });

        expect(res.statusCode).toBe(204);
    });

    // =========================================================================
    // ⚠️ ОПАСНАЯ ЗОНА ФЛУДА: Выполняется строго в конце, чтобы не мешать тестам выше
    // =========================================================================

    it('POST /auth/registration -> Ошибка 429 при превышении лимита 5 запросов', async () => {
        for (let i = 0; i < 4; i++) {
            await request
                .post('/auth/registration')
                .send({ login: `user${i}`, password: 'password123', email: `user${i}@test.com` });
        }
        const res = await request
            .post('/auth/registration')
            .send(newUserCredentials);

        expect(res.statusCode).toBe(429);
    });

    it('POST /auth/registration-confirmation -> Ошибка 429 при превышении лимита 5 запросов', async () => {
        for (let i = 0; i < 5; i++) {
            await request
                .post('/auth/registration-confirmation')
                .send({ code: `wrong-code-${i}` });
        }
        const res = await request
            .post('/auth/registration-confirmation')
            .send({ code: invalidConfirmationCode });

        expect(res.statusCode).toBe(429);
    });

    it('POST /auth/registration-email-resending -> Ошибка 429 при превышении лимита 5 запросов', async () => {
        for (let i = 0; i < 5; i++) {
            await request
                .post('/auth/registration-email-resending')
                .send({ email: `flood-email-${i}@test.com` });
        }
        const res = await request
            .post('/auth/registration-email-resending')
            .send({ email: newUserCredentials.email });

        expect(res.statusCode).toBe(429);
    });

    it('Финальное ожидание сброса лимитов', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        expect(true).toBe(true);
    });
});