import { NextFunction, Request, Response } from 'express';
import { HttpStatuses } from "../../../core/types/http-statuses";
import { ApiRequestsModel } from "../../../db/mongo.db";

// export const rateLimitGuard = async (req: Request, res: Response, next: NextFunction) => {
//
//     const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
//     const currentUrl = req.originalUrl || req.url;
//     const currentTime = new Date();
//     const tenSecondsAgo = new Date(currentTime.getTime() - 10 * 1000);
//
//     // 1. Сразу фиксируем текущую попытку запроса
//     await ApiRequestsModel.create({
//         ip: clientIp,
//         url: currentUrl,
//         date: currentTime
//     });
//
//     // 2. Считаем, сколько ВСЕГО запросов сделал этот IP на этот URL за последние 10 секунд
//     const currentAttemptsCount = await ApiRequestsModel
//         .countDocuments({
//             ip: clientIp,
//             url: currentUrl,
//             date: { $gte: tenSecondsAgo }
//         });
//
//     // 3. Если это уже 6-й (или более) запрос за 10 секунд — блокируем
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
//     const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
//     const currentUrl = req.originalUrl || req.url;
//     const currentTime = new Date();
//     const tenSecondsAgo = new Date(currentTime.getTime() - 10 * 1000);
//
//     // 1. СНАЧАЛА записываем текущий запрос в БД, чтобы он учитывался в счетчике
//     await ApiRequestsModel.insertOne({
//         ip: clientIp,
//         url: currentUrl,
//         date: currentTime
//     });
//
//
//     // 2. Ищем самый ПЕРВЫЙ запрос от этого IP на этот URL за последние 10 секунд
//     const firstRequestInWindow = await ApiRequestsModel.findOne(
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
//     const currentAttemptsCount = await ApiRequestsModel.countDocuments({
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

export const rateLimitGuard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
        if (clientIp && clientIp.includes(',')) {
            clientIp = clientIp.split(',')[0].trim();
        }

        let currentUrl = req.originalUrl || req.url;
        if (currentUrl && currentUrl.length > 1 && currentUrl.endsWith('/')) {
            currentUrl = currentUrl.slice(0, -1);
        }

        const currentTime = new Date();
        const tenSecondsAgo = new Date(currentTime.getTime() - 10 * 1000);

        // 1. Фиксируем попытку запроса
        await ApiRequestsModel.create({
            ip: clientIp,
            url: currentUrl,
            date: currentTime
        });

        // 2. Считаем запросы за последние 10 секунд
        const currentAttemptsCount = await ApiRequestsModel.countDocuments({
            ip: clientIp,
            url: currentUrl,
            date: { $gte: tenSecondsAgo }
        });

        // 3. Блокируем, если лимит превышен
        if (currentAttemptsCount > 5) {
            return res.sendStatus(HttpStatuses.TooManyRequests_429);
        }

        return next();

    } catch (error) {
        console.error("Error in rateLimitGuard:", error);
        return res.sendStatus(500);
    }
};