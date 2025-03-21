import { Server } from "midori/app";
import {
    CORSMiddleware,
    DispatchMiddleware,
    ErrorMiddleware,
    ErrorLoggerMiddleware,
    HTTPErrorMiddleware,
    ImplicitHeadMiddleware,
    ImplicitOptionsMiddleware,
    MethodNotAllowedMiddleware,
    NotFoundMiddleware,
    ParseBodyMiddleware,
    PublicPathMiddlewareFactory,
    RequestLoggerMiddleware,
    ResponseCompressionMiddleware,
    RouterMiddleware
} from "midori/middlewares";

/**
 * Pipelining
 *
 * Define your pipeline here.
 * Use the server.pipe() method to add middlewares to the pipeline.
 * The order here matters, as the middlewares are chained in the same order they are added.
 */

export default function pipeline(server: Server): void {
    /**
     * Log every request using the Logger Service Provider
     *
     * Put this middleware before the ErrorMiddleware to log every request, even 500
     */
    server.pipe(RequestLoggerMiddleware);

    // Add CORS headers to every response
    server.pipe(CORSMiddleware);

    /**
     * Handle any uncaught Error during the request processing
     *
     * This middleware should be one of the first middlewares in the pipeline
     */
    server.pipe(ErrorMiddleware);

    /**
     * Log every error using the Logger Service Provider
     *
     * This middleware throws every error it receives, so it should be after ErrorMiddleware in the pipeline
     */
    server.pipe(ErrorLoggerMiddleware);

    /**
     * Handle any uncaught HTTPError, and return a JSON response
     */
    server.pipe(HTTPErrorMiddleware);

    // Add your own pre-processing middlewares here
    //
    server.pipe(ResponseCompressionMiddleware);

    /**
     * Register the router middleware, which will handle all incoming requests
     *
     * The Router Middleware saves the matched route in the request context, and calls the next middleware
     */
    server.pipe(RouterMiddleware);

    /**
     * These middlewares are not required, but they are useful to a REST API
     *
     * ImplicitHeadMiddleware will automatically respond to HEAD requests with the same response as the corresponding GET request, but without the body
     * ImplicitOptionsMiddleware will automatically respond to OPTIONS requests with the allowed methods for the requested route
     * MethodNotAllowedMiddleware will automatically respond to requests with an invalid method with a 405 Method Not Allowed response
     */
    server.pipe(ImplicitHeadMiddleware);
    server.pipe(ImplicitOptionsMiddleware);
    server.pipe(MethodNotAllowedMiddleware);

    /**
     * Read the request body, then parse it based on the Content-Type header
     */
    server.pipe(ParseBodyMiddleware);

    // Add here any middlewares that should be executed before the route handler
    //

    /**
     * Dispatch the Middleware Chain the Router Middleware found
     */
    server.pipe(DispatchMiddleware);

    // Add here any middlewares that should be executed when the DispatchMiddleware fails to find a route
    //

    /**
     * Called when no route was found
     *
     * When no route matches the request, PublicPathMiddleware will try to find a matching file in the public directory.
     * The public directory is relative to the project root.
     */
    !server.production && server.pipe(PublicPathMiddlewareFactory({ path: './public' }));
    server.pipe(NotFoundMiddleware);
}
