/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global jQuery: false, module: false, test: false, expect: false,
  strictEqual: false, window: false, ok: false, QUnit: false,
  asyncTest: false, start: false, stop: false, deepEqual: false */

(function ($) {

    var testData;

    QUnit.reset = function () {
        try {
            window.localStorage.clear();
        } catch (e) {
            // Fail silently if localStorage is not supported.
            // Support is checked in the first test case.
        }
        testData = {
            "success": true,
            "data": [
                "först item",
                "secönd itém"
            ],
            "Weird väl": 666
        };
    };
    QUnit.reset();

    module('JSONCache');

    var JSONCache = window.JSONCache;

    // Alias to the strict comparison function of QUnit (using ===).
    var eq = strictEqual;

    test('Requirements.', function () {
        expect(7);

        // Detect native JSON parser support.
        var jsonSupported = function () {
            return JSON &&
                typeof JSON.parse === 'function' &&
                typeof JSON.stringify === 'function';
        };

        // Detect localStorage support.
        var localStorageSupported = function () {
            try {
                return 'localStorage' in window && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        };

        eq(typeof window.jQuery, 'function', 'jQuery is required');
        eq(jsonSupported(), true, 'JSON is required');
        eq(localStorageSupported(), true, 'localStorage is required');
        eq(typeof JSONCache, 'object', 'JSONCache is required');
        eq(typeof JSONCache.getCachedJSON, 'function', 'JSONCache is required');
        eq(JSONCache.settings.browserOk, true, 'JSONCache.browserOk');
        eq(JSONCache.settings.prefix, 'JSONCache', 'JSONCache prefix must match the one used in tests.');
    });

    test('Basic localStorage functionality', function () {
        expect(2);
        // Initial conditions.
        eq(window.localStorage.length, 0, 'localStorage should be empty.');
        window.localStorage.test = 'åäö';
        eq(window.localStorage.test, 'åäö', 'Value should be saved in the localStorage.');
    });

    asyncTest('Basic fetch with an empty localStorage.', function () {
        expect(5);
        start();

        var proxyMockCallCount = 0;

        // Mock the json proxy to avoid networking.
        JSONCache._getJSONProxy = function (url, options) {
            proxyMockCallCount++;
            if (url === 'data.json') {
                options.success(testData);
            }
        };

        // Initial conditions.
        eq(window.localStorage.length, 0, 'localStorage should be empty.');

        JSONCache.getCachedJSON('data.json', {
            success: function (data) {
                deepEqual(data, {
                    success: true,
                    data: [
                        'först item',
                        'secönd itém'
                    ],
                    'Weird väl': 666
                }, 'Correct test data should be returned.');
                deepEqual(data, JSON.parse(window.localStorage['JSONCache data data.json']),
                          'localStorage should be populated with the correct data.');
                eq(proxyMockCallCount, 1, 'Mocked json proxy should be called once.');
                eq(window.localStorage.length, 1, 'There should be only one item in the localStorage.');
                stop();
            }
        });
    });

    // JSONCache.clear
    test('Cache item clearing with empty cache.', function () {
        expect(2);
        eq(window.localStorage.length, 0, 'localStorage should be empty in the beginning.');
        JSONCache.clear('http://example.org/key?param1=a%20b+c#hash-123');
        eq(window.localStorage.length, 0, 'localStorage should be empty in the end.');
    });
    test('Whole cache clearing with empty cache.', function () {
        expect(2);
        eq(window.localStorage.length, 0, 'localStorage should be empty in the beginning.');
        JSONCache.clear();
        eq(window.localStorage.length, 0, 'localStorage should be empty in the end.');
    });
    test('Cache item clearing with items in the cache.', function () {
        expect(3);
        eq(window.localStorage.length, 0, 'localStorage should be empty in the beginning.');

        var dataKey = 'JSONCache data http://example.org/key?param1=a%20b+c#hash-123';
        var timeKey = 'JSONCache time http://example.org/key?param1=a%20b+c#hash-123';
        window.localStorage[dataKey] = 'my dätä';
        window.localStorage[timeKey] = '123';

        window.localStorage['öther kéy'] = 'öther dätä';

        // Remove a certain item from the cache.
        JSONCache.clear('http://example.org/key?param1=a%20b+c#hash-123');

        eq(window.localStorage.length, 1, 'There should be one item in the localStorage.');
        eq(window.localStorage['öther kéy'], 'öther dätä', 'Correct data should be in the localStorage.');

    });
    test('Whole cache clearing with several items in the cache.', function () {
        expect(3);
        eq(window.localStorage.length, 0, 'localStorage should be empty in the beginning.');

        var dataKey = 'JSONCache data http://example.org/key?param1=a%20b+c#hash-123';
        var timeKey = 'JSONCache time http://example.org/key?param1=a%20b+c#hash-123';
        window.localStorage[dataKey] = 'my dätä';
        window.localStorage[timeKey] = '123';

        window.localStorage['JSONCache data http://example.org/data'] = 'my dätä 2';
        window.localStorage['JSONCache time http://example.org/time'] = '1234';

        window.localStorage['öther kéy'] = 'öther dätä';

        // Clear the whole cache.
        JSONCache.clear();

        eq(window.localStorage.length, 1, 'There should be one item in the localStorage.');
        eq(window.localStorage['öther kéy'], 'öther dätä', 'Correct data should be in the localStorage.');
    });

}(jQuery));
