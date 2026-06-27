import { Request, Response, NextFunction } from 'express';
import { apiRequestsCollection } from "../../db/mongo.db";
import { HttpStatuses } from "../../core/types/http-statuses";

export const rateLimitGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
    const currentUrl = req.originalUrl || req.url; // Важно трекать конкретный URL
    const currentTime = new Date();

    const tenSecondsAgo = new Date(currentTime.getTime() - 10 * 1000);

    // 1. Считаем в БД количество запросов от этого IP на этот URL за последние 10 секунд
    const currentAttemptsCount = await apiRequestsCollection.countDocuments({
        ip: clientIp,
        url: currentUrl,
        date: { $gte: tenSecondsAgo } // Дата должна быть больше или равна времени 10 секунд назад
    });

    // 2. Если уже набралось 5 или более запросов — блокируем (429)
    if (currentAttemptsCount >= 5) {
        return res.sendStatus(HttpStatuses.TooManyRequests_429);
    }

    // 3. Если лимит не превышен, логируем текущий запрос в БД
    await apiRequestsCollection.insertOne({
        ip: clientIp,
        url: currentUrl,
        date: currentTime
    });

    return next();
};




// export const rateLimitGuard = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
//     const currentUrl = req.originalUrl || req.url;
//     const currentTime = new Date();
//     const tenSecondsAgo = new Date(currentTime.getTime() - 10 * 1000);
//
//     // 1. СНАЧАЛА записываем текущий запрос в БД, чтобы он учитывался в счетчике
//     await apiRequestsCollection.insertOne({
//         ip: clientIp,
//         url: currentUrl,
//         date: currentTime
//     });
//
//     // 2. Ищем самый ПЕРВЫЙ запрос от этого IP на этот URL за последние 10 секунд
//     const firstRequestInWindow = await apiRequestsCollection.findOne(
//         {
//             ip: clientIp,
//             url: currentUrl,
//             date: { $gte: tenSecondsAgo }
//         },
//         { sort: { date: 1 } } // Сортируем по возрастанию, чтобы получить самый старый запрос
//     );
//
//     // Если запросов вообще не было (хотя один мы только что добавили), пропускаем
//     if (!firstRequestInWindow) {
//         return next();
//     }
//
//     // 3. Считаем количество запросов, начиная от времени САМОГО ПЕРВОГО запроса в окне
//     const currentAttemptsCount = await apiRequestsCollection.countDocuments({
//         ip: clientIp,
//         url: currentUrl,
//         date: { $gte: firstRequestInWindow.date } // Считаем строго от первого запроса
//     });
//
//     // 4. Если лимит превышен (больше 5 запросов от старта окна) — блокируем
//     if (currentAttemptsCount > 5) {
//         return res.sendStatus(HttpStatuses.TooManyRequests_429);
//     }
//
//     return next();
// };


// export const rateLimitGuard = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
//
//         // ОЧИЩАЕМ URL: берем только путь без query-параметров (?...)
//         // req.baseUrl + req.path гарантирует, что /auth/login?а=1 и /auth/login будут посчитаны как один URL
//         const currentUrl = req.baseUrl + req.path;
//
//         const currentTime = new Date();
//         // Отнимаем ровно 10 секунд
//         const tenSecondsAgo = new Date(currentTime.getTime() - 10 * 1000);
//
//         // 1. Считаем запросы строго за последние 10 секунд
//         const currentAttemptsCount = await apiRequestsCollection.countDocuments({
//             ip: clientIp,
//             url: currentUrl,
//             date: { $gte: tenSecondsAgo }
//         });
//
//         // 2. Если уже есть 5 запросов — блокируем ДО записи текущего запроса
//         if (currentAttemptsCount >= 5) {
//             return res.sendStatus(HttpStatuses.TooManyRequests_429);
//         }
//
//         // 3. Записываем текущий запрос в БД ПОСЛЕ проверки, чтобы он не мешал текущему счетчику
//         await apiRequestsCollection.insertOne({
//             ip: clientIp,
//             url: currentUrl,
//             date: currentTime
//         });
//
//         return next();
//     } catch (error) {
//         console.error("Rate limit guard database error:", error);
//         // Безопасный фолбек: если база упала, не вешаем сервер, а отдаем 500
//         return res.sendStatus(HttpStatuses.InternalServerError_500);
//     }
// };