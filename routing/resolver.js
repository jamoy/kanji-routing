/**
 * Resolver
 *
 * Resolve callbacks based on the function or a string that translates to
 * file path and an action separated by the @ sign.
 *
 * @author Jamoy <jamoy@hooq.tv>
 */
"use strict";

var path = require("path");

module.exports = function(callback, options)
{

    if (typeof callback === "function") {
        return callback;
    }

    if (typeof callback === "string") {
        var action = callback.split("@");
        if (options && options.namespace) {
            var file = path.join(options.namespace, action[0]),
                Controller = require(file),
                instance = new Controller();

            if (action[1] in instance) {
                return instance[action[1]];
            }

            throw new Error("Route action could not be found from " + file, 500);
        }
    }

};
