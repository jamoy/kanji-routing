/**
 * Router
 *
 * Routing facility for kanji based on laravel's routing module. Uses `route-parser` for route matching.
 *
 * @author Jamoy <jamoy@hooq.tv>
 */
"use strict";

var Route           = require("./routing/route"),
    RouteCollection = require("./routing/route_collection"),
    RouteResolver   = require("./routing/resolver"),
    RouteParser     = require("route-parser"),
    _               = require("underscore");

/**
 * Router
 *
 * @class Router
 */
class Router
{

    /**
     * Constructor
     *
     * @param options
     */
    constructor(options)
    {
        this.options        = options;
        this.collection     = new RouteCollection();

        this.currentRoute   = null;
    }

    /**
     * Create a Route and put it in the router's collection
     *
     * @param method
     * @param path
     * @param options
     * @param callback
     * @returns {Router}
     */
    match()
    {
        var method          = arguments[0],
            path            = arguments[1],
            callback        = typeof arguments[2] === "function" ? arguments[2]: arguments[3] || null,
            options         = typeof arguments[2] === "object" ? arguments[2]: {};

        options.prefix = this.cascadePrefix(options);

        if (options && options.middleware && this.options && this.options.middleware) {
            options.middleware = this.options.middleware.concat(options.middleware);
        }

        // we only use the route's uses directive instead of parent route config
        if (this.options && this.options.uses) {
            delete this.options.uses;
        }

        _.defaults(options, this.options);

        this.collection.add(new Route(method, path, options, callback));

        return this;
    }

    /**
     * Convenience method to match GET and HEAD requests.
     *
     * @param path
     * @param options
     * @param callback
     * @returns {Router}
     */
    get()
    {
        var args = Array.prototype.slice.call(arguments);
            args.unshift([ "GET", "HEAD" ]);
        return this.match.apply(this, args);
    }

    /**
     * Convenience method to match POST requests.
     *
     * @param path
     * @param options
     * @param callback
     * @returns {Router}
     */
    post()
    {
        var args = Array.prototype.slice.call(arguments);
            args.unshift([ "POST" ]);
        return this.match.apply(this, args);
    }

    /**
     * Convenience method to match PATCH requests.
     *
     * @param path
     * @param options
     * @param callback
     * @returns {Router}
     */
    patch()
    {
        var args = Array.prototype.slice.call(arguments);
            args.unshift([ "PATCH" ]);
        return this.match.apply(this, args);
    }

    /**
     * Convenience method to match PUT requests.
     *
     * @param path
     * @param options
     * @param callback
     * @returns {Router}
     */
    put()
    {
        var args = Array.prototype.slice.call(arguments);
            args.unshift([ "PUT" ]);
        return this.match.apply(this, args);
    }

    /**
     * Convenience method to match DELETE requests.
     *
     * @param path
     * @param options
     * @param callback
     * @returns {Router}
     */
    delete()
    {
        var args = Array.prototype.slice.call(arguments);
            args.unshift([ "DELETE" ]);
        return this.match.apply(this, args);
    }

    /**
     * Convenience method to match HEAD requests.
     *
     * @param path
     * @param options
     * @param callback
     * @returns {Router}
     */
    head()
    {
        var args = Array.prototype.slice.call(arguments);
            args.unshift([ "HEAD" ]);
        return this.match.apply(this, args);
    }

    /**
     * Convenience method to match ANY http methods.
     *
     * @param path
     * @param options
     * @param callback
     * @returns {Router}
     */
    any()
    {
        var args = Array.prototype.slice.call(arguments);
            args.unshift([ "HEAD", "OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE" ]);
        return this.match.apply(this, args);
    }

    /**
     * Dispatch a route based on a Request
     *
     * @param context
     * @param resolver
     */
    dispatch(context, resolver)
    {
        var url = decodeURIComponent(context.request.url);

        for (var route in this.collection.all()) {
            url = url.trim().replace(/^\//, "").replace(/\/$/, "");

            var parsed = new RouteParser(route),
                params = parsed.match(url);

            if (params) {
                var method = context.request.method || "GET";

                if (!(method in this.collection.get(route))) {
                    throw new Error("Method not allowed", 405);
                }

                // assign currentRoute
                var node = this.currentRoute = this.collection.get(route, method);
                if (node.matchDomain(context.request)) {
                    this.setResolver(resolver);

                    return this.makeCallables(node, params, method);
                }
            }
        }

        throw new Error("Page not found", 404);
    }

    /**
     * Create the array of callable methods
     *
     * @param node
     * @param params
     * @param method
     * @returns {Array}
     */
    makeCallables(node, params, method)
    {
        var callables = [],
            middlewares = node.getOptions("middleware") || [];

        callables.push(function* (next)
        {
            this.options = node.getOptions();
            this.params = params;
            yield next;
        });

        var resolver = this.getResolver();

        if (middlewares) {
            for (var middleware of middlewares) {
                if (typeof middleware === "function") {
                    callables.push(resolver(middleware));
                }
            }
        }

        if (typeof node.getCallback() === "function") {
            callables.push(resolver(node.getCallback()));
        } else if (node.getOptions("uses")) {
            var action = node.getOptions("uses");
            callables.push(resolver(action, node.getOptions()));
        } else {
            throw new Error("Route requires action", 500);
        }

        callables.push(function* (next)
        {
            yield next;
            if (method === "HEAD") {
                this.body = null;
            }
        });

        return callables;
    }

    /**
     * Create a Route group
     *
     * @param options
     * @param scope
     * @returns {Router}
     */
    group(options, scope)
    {
        if (typeof scope === "function") {
            // we cascade the `prefix`
            options.prefix = this.cascadePrefix(options);

            if (this.options && this.options.middleware) {
                options.middleware = this.options.middleware.concat(options.middleware);
            }

            _.defaults(options, this.options);
            var router = new Router(options);
            scope(router);

            // put the route collections in the main stack
            this.collection.extend(router.collection);
        }

        return this;
    }

    /**
     * Get Current Route's name
     *
     * @returns {string|null}
     */
    currentRouteName()
    {
        return this.currentRoute.options.as || null;
    }

    /**
     * Get Current Route's options
     *
     * @returns {*|{}}
     */
    currentRouteOptions()
    {
        return this.currentRoute.options || {};
    }

    /**
     * Cascade prefix based on the context's option and the provided one
     *
     * @access private
     * @param options
     * @returns {string}
     */
    cascadePrefix(options)
    {
        var prefixes = [];
        if (this.options && this.options.prefix) {
            prefixes.push(this.options.prefix);
        }
        if (options && options.prefix) {
            prefixes.push(options.prefix);
        }
        return prefixes.join("/");
    }

    /**
     * Set the Resolver
     *
     * @param resolver
     */
    setResolver(resolver)
    {
        this.resolver = resolver;

        return this;
    }

    /**
     * Get the resolver
     *
     * @returns {Resolver}
     */
    getResolver()
    {
        return this.resolver || RouteResolver;
    }

}

// Fetch an existing instance
module.exports = global.Router = global.Router || new Router();

// Expose Router class
module.exports.Router = Router;
