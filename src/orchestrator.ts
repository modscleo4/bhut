// Manage the multiple threads of the application

import cluster from "cluster";
import { cpus } from "os";

if (cluster.isPrimary) {
    const maxWorkers = process.env.MAX_WORKERS ? parseInt(process.env.MAX_WORKERS) : cpus().length;
    for (let i = 0; i < maxWorkers; i++) {
        cluster.fork().on('exit', function onExit(code, signal) {
            console.error(`Worker ${i} died with code ${code} and signal ${signal}`);

            // Try to start a new worker
            cluster.fork().on('exit', onExit);
        });
    }
} else {
    console.log(`Worker ${process.pid} started`);
    await import('./server.js');
}
