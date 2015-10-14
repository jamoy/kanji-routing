/**
 * Routing/Route
 *
 * Route object
 *
 * @author Jamoy <jamoy@hooq.tv>
 */
"use strict";

/**
 * Route
 *
 * @class Route
 */
class Route
{

    /**
     * Constructor
     *
     * @param method
     * @param path
     * @param options
     * @param callback
     */
    constructor(method, path, options, callback)
    {
        // apply the prefix
        if (options && options.prefix) {
            path = this.sanitizePath(options.prefix) + "/" + path;
        }

        this.path = this.sanitizePath(path);
        this.method = method;
        this.options = options;
        this.callback = callback || options.uses || null;
    }

    /**
     * Get Path
     *
     * @returns {*}
     */
    getPath()
    {
        return this.path;
    }

    /**
     * Get Method
     *
     * @returns {*}
     */
    getMethod()
    {
        return this.method;
    }

    /**
     /**
     * Get Options
     *
     * @param namespace
     * @returns {*}
     */
    getOptions(namespace)
    {
        if (namespace) {
            if (namespace in this.options) {
                return this.options[namespace];
            }

            return null;
        }

        return this.options;
    }

    /**
     * Get Main Callback
     *
     * @returns {*}
     */
    getCallback()
    {
        return this.callback;
    }

    /**
     * Sanitize Path by trimming the slashes
     *
     * @param path
     * @returns {string}
     */
    sanitizePath(path)
    {
        return path.trim().replace(/^\//, "").replace(/\/$/, "");
    }

    /**
     * Match the Domain
     *
     * @param request
     * @returns {boolean}
     */
    matchDomain(request)
    {
        var domain = this.getOptions("domain");
        if (domain && request.headers && request.headers.host && request.headers.host !== domain) {
            return false;
        }

        return true;
    }
}

module.exports = Route;
