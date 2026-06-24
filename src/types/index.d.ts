import 'express';

declare global {
    namespace Express {
        export interface Request {
            user: { id: string | null; };
            deviceId: string;
            useragent?: Details;
        }
    }
}