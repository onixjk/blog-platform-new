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
