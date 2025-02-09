import { Server } from "midori/app";
import { Scrypt } from "midori/hash";
import { ConsoleLogAdapter, Logger, LogLevel } from "midori/log";
import {
    HashServiceProviderFactory,
    JWTServiceProvider,
    LoggerServiceProviderFactory,
    RouterServiceProviderFactory,
} from "midori/providers";
import { Router } from "midori/router";

import router from '@app/routes/index.js';
import BHUTServiceProvider from "@app/providers/BHUTServiceProvider.js";

/**
 * Service Providers
 *
 * Define your service providers here.
 * Use the server.install() method to install service providers to the application.
 * Use the app.services.get() method to recover the service in your handlers and/or middleware constructors.
 */

export default function providers(server: Server): void {
    server.install(RouterServiceProviderFactory(Router.clone(router)));
    server.install(LoggerServiceProviderFactory(new Logger({ adapters: [new ConsoleLogAdapter(server.production ? LogLevel.INFO : LogLevel.DEBUG, true)] })));

    // Add providers here
    // Recover the provider with app.services.get(ServiceProvider) in your handlers and middleware constructors
    server.install(JWTServiceProvider);
    server.install(HashServiceProviderFactory(new Scrypt()));
    server.install(BHUTServiceProvider);
}
