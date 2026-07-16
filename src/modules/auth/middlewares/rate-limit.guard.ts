import { NextFunction, Request, Response } from 'express';
import { HttpStatuses } from "../../../core/types/http-statuses";
import { ApiRequestsModel } from "../../../db/mongo.db";

export const rateLimitGuard = async (req: Request, res: Response, next: NextFunction) => {

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
    const currentUrl = req.originalUrl || req.url;
    const currentTime = new Date();
    const tenSecondsAgo = new Date(currentTime.getTime() - 10 * 1000);

    // 1. Сразу фиксируем текущую попытку запроса
    await ApiRequestsModel.create({
        ip: clientIp,
        url: currentUrl,
        date: currentTime
    });

    // 2. Считаем, сколько ВСЕГО запросов сделал этот IP на этот URL за последние 10 секунд
    const currentAttemptsCount = await ApiRequestsModel
        .countDocuments({
            ip: clientIp,
            url: currentUrl,
            date: { $gte: tenSecondsAgo }
        });

    // 3. Если это уже 6-й (или более) запрос за 10 секунд — блокируем
    if (currentAttemptsCount > 5) {
        return res.sendStatus(HttpStatuses.TooManyRequests_429);
    }

    return next();
};
