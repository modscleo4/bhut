import { EStatusCode, Handler, Request, Response } from "midori/http";
import { HTTPError } from "midori/errors";
import { Application } from "midori/app";

import { z } from "zod";

import BHUTService from "@app/services/BHUTService.js";

import BHUTServiceProvider from "@app/providers/BHUTServiceProvider.js";
import { amqp, queue } from "@core/amqp.js";
import { Logger } from "midori/log";
import { LoggerServiceProvider } from "midori/providers";
import { redis } from "@core/redis.js";

const Car = z.object({
    nome: z.string(),
    marca: z.string(),
    preco: z.number().min(0.01),
    anoFabricacao: z.number().int(),
});

const REDIS_CACHE_KEY = "bhut_cars";

export class List extends Handler {
    #bhutService: BHUTService;

    constructor(app: Application) {
        super(app);

        this.#bhutService = app.services.get(BHUTServiceProvider);
    }

    override async handle(req: Request): Promise<Response> {
        if (await redis.exists(REDIS_CACHE_KEY)) {
            const cars = JSON.parse((await redis.get(REDIS_CACHE_KEY))!);

            return Response.json(cars);
        }

        const cars = await this.#bhutService.getCars(true);
        await redis.set(REDIS_CACHE_KEY, JSON.stringify(cars), { EX: 5 });

        return Response.json(cars);
    }
}

export class Create extends Handler {
    #bhutService: BHUTService;
    #logger: Logger;

    constructor(app: Application) {
        super(app);

        this.#logger = app.services.get(LoggerServiceProvider);
        this.#bhutService = app.services.get(BHUTServiceProvider);
    }

    override async handle(req: Request): Promise<Response> {
        const car = Car.parse(req.parsedBody);

        const carId = await this.#bhutService.createCar(car);
        await redis.del("bhut_cars");

        this.#logger.info(`Car ${carId} created.`);
        amqp.sendToQueue(queue, Buffer.from(JSON.stringify({ carId, timestamp: Date.now() })));

        return Response.status(EStatusCode.CREATED).json({ id: carId });
    }
}
