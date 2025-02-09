import { Server } from "midori/app";

import config from './config.js';
import cron from './cron.js';
import pipeline from "./pipeline.js";
import providers from "./providers.js";

import env from "@core/env.js";
import { mongodb } from "@core/mongodb.js";
import { redis } from "@core/redis.js";

export const server = new Server({ production: env.NODE_ENV === 'PRODUCTION' });

config(server);
providers(server);
pipeline(server);
cron(server);

await new Promise<void>((resolve, reject) => {
    server.listen(env.PORT).on('listening', async () => {
        console.log(`Server is running on port ${env.PORT} in ${server.production ? 'production' : 'development'} mode`);
        await mongodb.connect();
        await redis.connect();
        resolve();
    }).on('close', async () => {
        await mongodb.close();
        await redis.disconnect();
    });
});
