/*jslint white: true, devel: true, onevar: false, undef: true, nomen: true,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global jQuery: false, window: false */

(function ($) {


    // Configuration.
    var config = {
        debug: true,
        prefix: 'JSONCache.'
    };

    var log = function () {
        if (config.debug && window.console) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('JSONCache:');
            console.log.apply(console, args);
        }
    };

    // Namespace for all the code.
    var JSONCache = {};

    JSONCache.getCachedJSON = function (options) {
        var url = options.url;
        var success = options.success;
        var key = config.prefix + options.url;
        var cachedData = window.localStorage[key];
        if (cachedData) {
            log('Value found from cache for url:', url);
            success(JSON.parse(cachedData));
        } else {
            log('Value not found in cache fetching data from url:', url);
            $.getJSON(url, function (data) {
                log('Fetched data, adding to cache for url:', url);
                window.localStorage[key] = JSON.stringify(data);
                success(data);
            });
        }
    };

    // Expose the namespace.
    window.JSONCache = JSONCache;

}(jQuery));
