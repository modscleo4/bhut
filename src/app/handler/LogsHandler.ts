import { EStatusCode, Handler, Request, Response } from "midori/http";
import { Application } from "midori/app";

import { db } from "@core/mongodb.js";

export class List extends Handler {
    override async handle(req: Request): Promise<Response> {
        const logs = await db.collection("logs").find().toArray();

        return Response.json(logs);
    }
}
