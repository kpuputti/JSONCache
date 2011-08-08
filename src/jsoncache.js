/**
 * @preserve JSONCache version #VERSION#
 *
 * Copyright (c) 2011 Kimmo Puputti
 * Licenced under the MIT licence.
 * See LICENCE file for more information.
 *
 * Authors:
 * Kimmo Puputti (first.last@futurice.com)
 * Jarno Rantanen (first.last@futurice.com)
 *
 * See README.rst at https://github.com/kpuputti/JSONCache
 * for requirements and usage.
 */
/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global jQuery: false, window: false */

(function ($) {

	"use strict"; // trigger ECMAScript 5 Strict Mode

    // Constants.
    var KEY_SIZE_TOTAL = 'JSONCache size';
    var KEY_PREF_DATA = 'JSONCache data ';
    var KEY_PREF_TIME = 'JSONCache time ';

    // Configuration.
    var settings = {

        // This is expanded by the build process from the VERSION file.
        version: '#VERSION#',

        // Flag to see console.log calls.
        debug: true,

        // Number of times the JSON is attempted to fetch on network errors.
        numTries: 5,

        // Time in milliseconds to wait after each timeout before a re-try.
        waitTime: 200,

        // Cache item validity lifetime in milliseconds.
        itemLifetime: 5 * 60 * 1000,

        // Maximum size allowed for the cache, in bytes; null for unlimited (by JSONCache that is).
        maxCacheSize: 2621440,

        // Whether to automatically evict older entries to make space for new ones when the cache fills up (if false, Errors are thrown instead)
        autoEvict: true
    };

    // Namespace for all the code.
    var JSONCache = {};
    JSONCache.settings = settings;

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

    // Adds the given number of characters to the current size of the cache.
    // Use negative char counts to subtract.  Removes the size-tracking key
    // whenever cache size is zero.
    var addToCacheSize = function (charCount) {
        if (typeof charCount !== 'number') {
            throw new Error('Cannot update cache total size without a char count');
        }
        var current = parseInt(window.localStorage[KEY_SIZE_TOTAL], 10);
        if (isNaN(current)) {
            current = 0;
        }
        var updated = current + charCount * 2; // assume 2-byte-wide characters
        if (updated <= 0) {
            // updated < 0 means there's an inconsitency between what JSONCache thinks is in localStorage
            // and what actually is.  If this happens, it's either due to a bug in JSONCache or the user
            // manipulating the cache by bypassing JSONCache.  updated === 0 is OK though.
            // TODO: Should we rather throw an Error here..?
            delete window.localStorage[KEY_SIZE_TOTAL];
        } else {
            window.localStorage[KEY_SIZE_TOTAL] = updated;
        }
    };

    // Adds the given data object to the cache, keyed under the given url.
    // Note that the data is assumed to be in its original object state,
    // and will only get serialized/stringified here.
    var addToCache = function (url, data) {
        var stringified = JSON.stringify(data);
        var addedLen = stringified.length;
        var timestamp = JSONCache._getTime();
        var newSize = function () {
            return JSONCache.getCacheSize() + addedLen * 2;
        };
        var tryAdd = function () {
            if (newSize() > settings.maxCacheSize) {
                throw new Error('Cache add would exceed maxCacheSize (' + newSize() + ' > ' + settings.maxCacheSize + ')');
            }
            try {
                window.localStorage[KEY_PREF_DATA + url] = stringified;
                window.localStorage[KEY_PREF_TIME + url] = timestamp;
                addToCacheSize(addedLen);
            } catch (e) {
                throw new Error('Error adding data to localStorage, quota might be full.');
            }
        };

        if (!settings.autoEvict) { // let's not use any kind of eviction policy - the add simply succeeds or fails with an Error
            tryAdd();
            return;
        }

        while (true) {
            try {
                tryAdd();
                return;
            } catch (e) {
                if (JSONCache.getCacheSize() === 0) {
                    throw new Error('Cache add would exceed maxCacheSize (' + newSize() + ' > ' + settings.maxCacheSize + ') even after autoEvicting everything');
                }
                JSONCache.purgeOldest(); // try to make space for the new item by evicting the oldest entry
            }
        }
    };

    // Returns the size of the current cache (as thought to be by JSONCache), in bytes.
    // TODO: Add option to also return size with key lengths taken into account..?
    JSONCache.getCacheSize = function () {
        var size = parseInt(window.localStorage[KEY_SIZE_TOTAL], 10);
        return isNaN(size) ? 0 : size;
    };

    var cacheItemValid = function (timestr) {
        var time = parseInt(timestr, 10);
        return !isNaN(time) && (time + settings.itemLifetime >= JSONCache._getTime());
    };

    // Remove a certain item from the localStorage cache.
    // If the url is given as an argument, then only that
    // particular item is removed, otherwise all the items
    // stored by JSONCache are removed.
    JSONCache.clear = function (url) {
        if (url) {
            // Remove a particular item.
            if (window.localStorage[KEY_PREF_DATA + url]) {
                var charsToRemove = window.localStorage[KEY_PREF_DATA + url].length;
                addToCacheSize(-1 * charsToRemove);
            }
            window.localStorage.removeItem(KEY_PREF_DATA + url);
            window.localStorage.removeItem(KEY_PREF_TIME + url);
        } else {
            // Remove all items (stored by JSONCache) if no url was specified.

            // Regexp to match keys stored with JSONCache.
            var cacheKeyRe = /^JSONCache (data|time) /;
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

            // Update cache total size.
            delete window.localStorage[KEY_SIZE_TOTAL];
        }
    };

    // Remove all expired items from the cache.
    JSONCache.clean = function () {
        var timeKeyRe = /^JSONCache time ([\S]+)$/;
        var key, match;
        var urlsToRemove = [];
        var i;
        var len = window.localStorage.length;
        for (i = 0; i < len; ++i) {
            key = window.localStorage.key(i);
            match = timeKeyRe.exec(key);
            if (match && !cacheItemValid(window.localStorage[key])) {
                urlsToRemove.push(match[1]);
            }
        }
        len = urlsToRemove.length;
        for (i = 0; i < len; ++i) {
            JSONCache.clear(urlsToRemove[i]);
        }
    };

    JSONCache.purgeOldest = function () {
        var timeKeyRe = /^JSONCache time /;
        var timeKeyOldest;
        var timeOldest = null;

        var key, time;
        var len = window.localStorage.length;

        for (var i = 0; i < len; ++i) {
            key = window.localStorage.key(i);
            if (!timeKeyRe.test(key)) {
                // Skip on other keys than JSONCache time keys.
                continue;
            }
            time = parseInt(window.localStorage[key], 10);
            if (!isNaN(time) && (timeOldest === null || time < timeOldest)) {
                timeKeyOldest = key;
                timeOldest = time;
            }
        }
        // Remove the oldest item data and time records.
        if (timeOldest !== null) {
            JSONCache.clear(timeKeyOldest.replace(KEY_PREF_TIME, ''));
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

    // Try to fetch the JSON multiple times.
    JSONCache._tryGetJSON = function (url, options, tryNumber, waitTime) {
        if (tryNumber > settings.numTries) {
            log('Tried fetching', tryNumber - 1, 'times already, returning.');
            if (typeof options.ongiveup === 'function') {
                options.ongiveup('timeout');
            }
            return;
        }

        options.error = function (jqXHR, textStatus, errorThrown) {
            log('Ajax error with status:', textStatus);
            if (typeof options.onerror === 'function') {
                options.onerror(jqXHR, textStatus, errorThrown, tryNumber);
            }
            window.setTimeout(function () {
                JSONCache._tryGetJSON(url, options, tryNumber + 1, waitTime * 2);
            }, waitTime);
        };

        if (typeof options.ontry === 'function') {
            options.ontry(tryNumber);
        }

        JSONCache._getJSONProxy(url, options);
    };

    JSONCache.getCachedJSON = function (url, options) {
        options = options || {};
        var success = options.success;
        var cachedData = window.localStorage[KEY_PREF_DATA + url];
        var cachedTime = window.localStorage[KEY_PREF_TIME + url];

        if (cachedData && cacheItemValid(cachedTime)) {
            log('Value found from cache for url:', url);
            if (typeof success === 'function') {
                success(JSON.parse(cachedData));
            }
        } else {
            log('Value not found in cache fetching data from url:', url);

            // Wrap the success function to cache the data.
            options.success = function (data) {
                log('Fetched data, adding to cache for url:', url);
                addToCache(url, data);
                if (typeof success === 'function') {
                    success(data);
                }
            };
            // TODO: add support for user defined error function handling.

            // Assure a json datatype.
            options.dataType = 'json';
            JSONCache._tryGetJSON(url, options, 1, settings.waitTime);
        }
    };

    // Expose the namespace.
    window.JSONCache = JSONCache;

}(jQuery));
