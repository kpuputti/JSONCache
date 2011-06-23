/*jslint white: true, devel: true, onevar: false, undef: true, nomen: true,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global jQuery: false, window: false */

(function ($) {

    var log = function () {
        if (window.console) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('JSONCache:');
            console.log.apply(console, args);
        }
    };

    // Namespace for all the code.
    var JSONCache = {};

    // Configuration.
    var config = {

    };

    JSONCache.getCachedJSON = function (options) {

    };

    // Expose the namespace.
    window.JSONCache = JSONCache;

}(jQuery));
