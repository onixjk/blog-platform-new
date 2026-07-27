import { NextFunction, Request, Response } from 'express';
import { HttpStatuses } from "../../../core/types/http-statuses";
import { ApiRequestsModel } from "../../../db/mongo.db";

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