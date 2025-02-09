import { Router as RouterBuilder } from "midori/router";

import * as CarHandler from "@app/handler/CarHandler.js";
import * as LogsHandler from "@app/handler/LogsHandler.js";

import { addSwaggerRoutes } from "midori-swaggerui";

const Router = new RouterBuilder();

/**
 * Routing
 *
 * Define your routes here
 * Use the Router.get(), Router.post(), Router.put(), Router.patch(), Router.delete() methods to define your routes.
 * Use the Router.group() method to group routes under a common prefix.
 * Use the Router.route() method to define a route using a custom HTTP method.
 *
 * Beware of trailing slashes! The Dispatcher Middleware will NOT remove nor add trailing slashes to the request path
 * `GET /foo` and `GET /foo/` are different routes and will be dispatched to different handlers.
 *
 * You can add an parameter to the path by using the {parameterName} syntax. The parameter will be available in the params property of the Request.
 *
 * Example:
 * Router.get('/user/{id}', UserHandler.Show).withName('user.show');
 */

addSwaggerRoutes(Router);

Router.group('/api', () => {
    Router.group('/car', () => {
        Router.get('', CarHandler.List).withName('post.list');
        Router.post('', CarHandler.Create).withName('post.create');
    });

    Router.group('/logs', () => {
        Router.get('', LogsHandler.List).withName('log.list');
    });
});

export default Router;
