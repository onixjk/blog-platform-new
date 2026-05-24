import express from 'express';
import { setupApp } from './setup-app';
import { SETTINGS } from './core/settings/settings';
import { runDB } from './db/mongo.db';

const app = express();
setupApp(app);

export const bootstrap = async () => {
    const PORT = SETTINGS.PORT;

    await runDB(SETTINGS.MONGO_URL);

    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
            console.log(`Example app listening on port ${PORT}`);
        });
    }
    return app;
};

bootstrap();

export default app;
