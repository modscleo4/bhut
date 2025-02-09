import { Server } from "midori/app";
import {
    CompressionAlgorithm,
    CORSConfigProviderFactory,
    ErrorConfigProviderFactory,
    JWTConfigProviderFactory,
    RequestConfigProviderFactory,
    ResponseConfigProviderFactory
} from "midori/providers";

import env from "@core/env.js";

import BHUTConfigProviderFactory from "@app/providers/BHUTConfigProvider.js";

/**
 * Configuration Providers
 *
 * Define your configuration providers here.
 * Use the server.configure() method to add configuration providersto the application.
 * Use the app.config.get() method to recover the configuration in your handlers and/or middleware constructors.
 */

export default function config(server: Server): void {
    // Add configs here using `server.configure(ConfigProviderFactory(config))`
    // Recover the config with app.config.get(ConfigProvider) in your handlers and middleware constructors

    server.configure(CORSConfigProviderFactory({
        origin: env.CORS_ORIGIN || '*',
        methods: '*',
        headers: ['Authorization', '*'],
        maxAge: 86400,
        openerPolicy: 'same-origin',
        embedderPolicy: 'unsafe-none',
    }));

    server.configure(ErrorConfigProviderFactory({
        exposeErrors: env.EXPOSE_ERRORS || false,
    }));

    server.configure(RequestConfigProviderFactory({
        maxBodySize: 1024 * 1024
    }));

    server.configure(ResponseConfigProviderFactory({
        compression: {
            enabled: false,
            contentTypes: ['*/*'],
            levels: {
                [CompressionAlgorithm.BROTLI]: 4,
                [CompressionAlgorithm.DEFLATE]: 6,
                [CompressionAlgorithm.GZIP]: 6,
            },
        },
    }));

    server.configure(BHUTConfigProviderFactory({
        url: env.BHUT_URL,
        webhookUrl: env.BHUT_WEBHOOK_URL,
        username: env.BHUT_USERNAME,
        password: env.BHUT_PASSWORD,
    }));
}
