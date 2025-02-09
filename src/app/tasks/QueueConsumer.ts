import { Task } from "midori/scheduler";

import { amqp, queue } from "@core/amqp.js";
import { db } from "@core/mongodb.js";
import { BHUTConfig, BHUTConfigProvider } from "@app/providers/BHUTConfigProvider.js";
import { Application } from "midori/app";
import { Logger } from "midori/log";
import { LoggerServiceProvider } from "midori/providers";

export default class QueueConsumer extends Task {
    #config: BHUTConfig;
    #logger: Logger;

    constructor(app: Application) {
        super(app);

        this.#logger = app.services.get(LoggerServiceProvider);
        this.#config = app.config.get(BHUTConfigProvider)!;
    }

    override async run(): Promise<void> {
        const message = await amqp.get(queue);
        if (!message) {
            return;
        }

        this.#logger.info(`Received message ${message.properties.messageId} from queue ${queue}.`);
        amqp.ack(message);

        const { carId, timestamp } = JSON.parse(message.content.toString());
        db.collection("logs").insertOne({ source: 'queue', event: 'message', createdAt: timestamp, processedAt: Date.now(), carId });

        try {
            const res = await fetch(this.#config.webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ carId, timestamp }),
            });

            db.collection("logs").insertOne({ source: 'webhook', event: 'response', processedAt: Date.now(), carId, status: res.status });
        } catch (err) {
            db.collection("logs").insertOne({ source: 'webhook', event: 'error', processedAt: Date.now(), carId, error: err instanceof Error ? err.message : err });
        }
    }
}
