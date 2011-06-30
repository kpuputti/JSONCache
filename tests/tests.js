/*jslint white: true, devel: true, onevar: false, undef: true, nomen: true,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global jQuery: false, module: false, test: false, expect: false,
  strictEqual: false, window: false, ok: false, QUnit: false,
  asyncTest: false, start: false, stop: false, deepEqual: false */

(function ($) {

    var testData;

    QUnit.testStart = function () {
        window.localStorage.clear();
        testData = {
            "success": true,
            "data": [
                "först item",
                "secönd itém"
            ],
            "Weird väl": 666
        };
    };

    module('JSONCache');

    var JSONCache = window.JSONCache;

    // Alias to the strict comparison function of QUnit (using ===).
    var eq = strictEqual;

    test('Requirements.', function () {
        expect(6);

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
    });

    test('Basic localStorage functionality', function () {
        expect(1);
        window.localStorage.test = 'åäö';
        eq(window.localStorage.test, 'åäö', 'Value should be saved in the localStorage.');
    });

    asyncTest('Basic fetch with an empty localStorage.', function () {
        expect(5);
        start();

        var proxyMockCallCount = 0;

        // Mock the json proxy to avoid networking.
        JSONCache.getJSONProxy = function (url, callback) {
            proxyMockCallCount++;
            if (url === 'data.json') {
                callback(testData);
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

}(jQuery));
