/**
 * @preserve JSONCache version #VERSION#
 *
 * Author: Kimmo Puputti (kpuputti at gmail)
 *
 * See README.rst at https://github.com/kpuputti/JSONCache
 * for requirements and usage.
 */
/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global jQuery: false, window: false */

(function ($) {


    // Configuration.
    var settings = {

        // This is expanded by the build process from the VERSION.txt file.
        version: '#VERSION#',

        debug: true,
        prefix: 'JSONCache'
    };

    var log = function () {
        if (settings.debug && window.console) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('JSONCache:');
            console.log.apply(console, args);
        }
    };

    // Check the prerequisites for the browser.
    settings.browserOk = (function () {
        var jsonOk = window.JSON &&
            typeof window.JSON.parse === 'function' &&
            typeof window.JSON.stringify === 'function';
        var localStorageOk;
        try {
            localStorageOk =  'localStorage' in window && window.localStorage !== null;
        } catch (e) {
            localStorageOk = false;
        }
        return jsonOk && localStorageOk;
    }());

    // Namespace for all the code.
    var JSONCache = {};
    JSONCache.settings = settings;

    // Remove a certain item from the localStorage cache.
    // If the url is given as an argument, then only that
    // particular item is removed, otherwise all the items
    // stored by JSONCache are removed.
    JSONCache.clear = function (url) {
        if (url) {
            // Remove a particular item.
            window.localStorage.removeItem(settings.prefix + ' data ' + url);
            window.localStorage.removeItem(settings.prefix + ' time ' + url);
        } else {
            // Remove all items (stored by JSONCache) if no url was specified.

            // Regexp to match keys stored with JSONCache.
            var cacheKeyRe = new RegExp('^' + settings.prefix + ' (data|time) ');
            var i, key;
            var len = window.localStorage.length;
            var keysToBeRemoved = [];

            // List all keys that are stored with JSONCache
            for (i = 0; i < len; ++i) {
                key = window.localStorage.key(i);
                if (cacheKeyRe.test(key)) {
                    keysToBeRemoved.push(key);
                }
            }
            // Remove all listed keys.
            len = keysToBeRemoved.length;
            for (i = 0; i < len; ++i) {
                window.localStorage.removeItem(keysToBeRemoved[i]);
            }
        }
    };

    // Provide the proxy function for testing to mock the real jQuery.getJSON calls.
    JSONCache._getJSONProxy = function (url, options) {
        $.ajax(url, options);
    };

    // Wrap the timestamp generation for easier mocking in the tests.
    JSONCache._getTime = function () {
        return (new Date()).getTime();
    };

    JSONCache.getCachedJSON = function (url, options) {
        var now = (new Date()).getTime();
        var success = options.success;
        var dataKey = settings.prefix + ' data ' + url;
        var timeKey = settings.prefix + ' time ' + url;
        var cachedData = window.localStorage[dataKey];
        var cachedTime = window.localStorage[timeKey];

        if (cachedData) {
            log('Value found from cache for url:', url);
            success(JSON.parse(cachedData));
        } else {
            log('Value not found in cache fetching data from url:', url);

            // Wrap the success function to cache the data.
            options.success = function (data) {
                log('Fetched data, adding to cache for url:', url);
                window.localStorage[dataKey] = JSON.stringify(data);
                success(data);
            };
            // Assure a json datatype.
            options.dataType = 'json';
            JSONCache._getJSONProxy(url, options);
        }
    };

    // Expose the namespace.
    window.JSONCache = JSONCache;

}(jQuery));
