import QueueConsumer from "@app/tasks/QueueConsumer.js";
import { Server } from "midori/app";

/**
 * Cron Jobs
 *
 * Define your cron jobs here.
 * Use the server.schedule() method to add cron jobs to the application.
 */

export default function cron(server: Server): void {
    server.schedule('* * * * * *', QueueConsumer);
}
