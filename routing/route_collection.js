/**
 * Routing/Route_collection
 *
 * Collection of routing/route objects.
 *
 * @author Jamoy <jamoy@hooq.tv>
 */
"use strict";

var _ = require("underscore");

/**
 * RouteCollection
 *
 * @class RouteCollection
 */
class RouteCollection
{

    /**
     * Constructor
     */
    constructor()
    {
        this.collection = [];
    }

    /**
     * Add a route to a route collection
     *
     * @param {Route}
     * @returns {RouteCollection}
     */
    add(route)
    {
        if (typeof route === "object") {
            var path = route.getPath();

            this.collection[path] = this.collection[path] || {};
            var methods = route.getMethod();
            for (let verb of methods) {
                this.collection[path][verb] = route;
            }
        }

        return this;
    }

    /**
     * Get a route based on path and method
     *
     * @param path
     * @param method
     * @returns {*}
     */
    get(path, method)
    {
        if (method in this.collection[path]) {
            return this.collection[path][method];
        }

        return this.collection[path] || null;
    }

    /**
     * Get all routes
     *
     * @returns {Array}
     */
    all()
    {
        return this.collection;
    }

    /**
     * Extend the router for stacking
     *
     * @param router
     */
    extend(router)
    {
        _.extend(this.collection, router.all());
    }

}

module.exports = RouteCollection;
