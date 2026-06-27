import supertest from 'supertest';

const baseUrl = 'http://localhost:5001';
const request = supertest(baseUrl);

describe('Isolated API Rate Limiting Tests (Swagger 429 Coverage)', () => {
    // ⚠️ Увеличиваем глобальный таймаут Jest для этого файла до 60 секунд,
    // так как внутри мы используем долгие паузы для сброса счетчиков IP
    jest.setTimeout(60000);

    const credentials = {
        login: 'ratetester',
        password: 'password123',
        email: 'rate@test.com'
    };
    const invalidConfirmationCode = 'invalid-code-12345';

    // Очищаем базу перед стартом нагрузочных тестов
    beforeAll(async () => {
        await request.delete('/testing/all-data');
    });

    it('POST /auth/login -> Ошибка 429 при флуде авторизации (более 5 запросов за 10 секунд)', async () => {
        // Делаем 5 быстрых запросов подряд
        for (let i = 0; i < 5; i++) {
            await request.post('/auth/login').send({ loginOrEmail: credentials.login, password: 'wrong-password' });
        }

        // 6-й запрос гарантированно натыкается на блокировку 429
        const res = await request.post('/auth/login').send({ loginOrEmail: credentials.login, password: credentials.password });
        expect(res.statusCode).toBe(429);
    });

    it('POST /auth/registration -> Ошибка 429 при флуде регистрации (более 5 запросов за 10 секунд)', async () => {
        // 🔥 Ожидаем 10.5 секунд, чтобы сервер полностью разблокировал наш IP от прошлого теста логина
        await new Promise((resolve) => setTimeout(resolve, 10500));

        for (let i = 0; i < 5; i++) {
            await request.post('/auth/registration').send({ login: `user${i}`, password: 'password123', email: `user${i}@test.com` });
        }
        const res = await request.post('/auth/registration').send(credentials);
        expect(res.statusCode).toBe(429);
    });

    it('POST /auth/registration-confirmation -> Ошибка 429 при флуде кодами подтверждения', async () => {
        // 🔥 Ожидаем 10.5 секунд для сброса блокировки IP
        await new Promise((resolve) => setTimeout(resolve, 10500));

        for (let i = 0; i < 5; i++) {
            await request.post('/auth/registration-confirmation').send({ code: `wrong-code-${i}` });
        }
        const res = await request.post('/auth/registration-confirmation').send({ code: invalidConfirmationCode });
        expect(res.statusCode).toBe(429);
    });

    it('POST /auth/registration-email-resending -> Ошибка 429 при флуде запросами на переотправку email', async () => {
        // 🔥 Ожидаем 10.5 секунд для сброса блокировки IP
        await new Promise((resolve) => setTimeout(resolve, 10500));

        for (let i = 0; i < 5; i++) {
            await request.post('/auth/registration-email-resending').send({ email: `flood-${i}@test.com` });
        }
        const res = await request.post('/auth/registration-email-resending').send({ email: credentials.email });
        expect(res.statusCode).toBe(429);
    });
});
