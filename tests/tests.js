/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global jQuery: false, module: false, test: false, expect: false,
  strictEqual: false, window: false, ok: false, QUnit: false,
  asyncTest: false, start: false, stop: false, deepEqual: false */

(function ($) {

    var JSONCache = window.JSONCache;
    var _numTries = JSONCache.settings.numTries;
    var _waitTime = JSONCache.settings.waitTime;
    var _getJSONProxy = JSONCache._getJSONProxy;
    var _getTime = JSONCache._getTime;
    var _tryGetJSON = JSONCache._tryGetJSON;
    var testData;

    QUnit.reset = function () {
        try {
            window.localStorage.clear();
        } catch (e) {
            // Fail silently if localStorage is not supported.
            // Support is checked in the first test case.
        }

        // Put back the original settings and functions after
        // injecting the mocks.
        JSONCache.settings.numTries = _numTries;
        JSONCache.settings.waitTime = _waitTime;
        JSONCache._getJSONProxy = _getJSONProxy;
        JSONCache._getTime = _getTime;
        JSONCache._tryGetJSON = _tryGetJSON;

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


    // Alias to the strict comparison function of QUnit (using ===).
    var eq = strictEqual;

    test('Requirements.', function () {
        expect(9);

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

        eq(JSONCache.settings.numTries, 5, 'numTries should be the one expected.');
        eq(JSONCache.settings.waitTime, 200, 'waitTime should be the one expected.');
        eq(JSONCache.settings.itemLifetime, 5 * 60 * 1000, 'itemLifetime should be the one expected.');
    });

    test('Basic localStorage functionality', function () {
        expect(2);
        // Initial conditions.
        eq(window.localStorage.length, 0, 'localStorage should be empty.');
        window.localStorage.test = 'åäö';
        eq(window.localStorage.test, 'åäö', 'Value should be saved in the localStorage.');
    });

    asyncTest('Basic fetch with an empty localStorage.', function () {
        expect(7);

        var proxyMockCallCount = 0;
        // Mock the json proxy to avoid networking.
        JSONCache._getJSONProxy = function (url, options) {
            proxyMockCallCount++;
            if (url === 'data.json') {
                options.success(testData);
            }
        };
        var timeMockCallCount = 0;
        // Mock the timestamp function for a static timestamp.
        JSONCache._getTime = function () {
            timeMockCallCount++;
            return 2345678901234;
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
                eq(window.localStorage['JSONCache time data.json'], '2345678901234',
                   'Timestamp should be the one returned by the static mock function.');
                eq(proxyMockCallCount, 1, 'Mocked json proxy should be called once.');
                eq(timeMockCallCount, 1, 'Mocked timestamp function should be called once.');
                eq(window.localStorage.length, 2, 'There should be two items in the localStorage.');
                start();
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

    test('Test oldest item removing with empty cache.', function () {
        expect(2);
        eq(window.localStorage.length, 0, 'localStorage should be empty in the beginning.');
        JSONCache.purgeOldest();
        eq(window.localStorage.length, 0, 'localStorage should be empty in the end.');
    });
    test('Test oldest item removing with one item in the cache.', function () {
        expect(2);
        eq(window.localStorage.length, 0, 'localStorage should be empty in the beginning.');

        window.localStorage['JSONCache data http://example.org/data'] = 'söme dätä';
        window.localStorage['JSONCache time http://example.org/data'] = '123';

        JSONCache.purgeOldest();
        eq(window.localStorage.length, 0, 'localStorage should be empty in the end.');
    });
    test('Test oldest item removing with several items in the cache.', function () {
        expect(6);
        eq(window.localStorage.length, 0, 'localStorage should be empty in the beginning.');

        window.localStorage['JSONCache data http://example.org/data1'] = 'söme dätä 1';
        window.localStorage['JSONCache time http://example.org/data1'] = '1001';
        window.localStorage['JSONCache data http://example.org/data2'] = 'söme dätä 2';
        window.localStorage['JSONCache time http://example.org/data2'] = '1002';
        window.localStorage['JSONCache data http://example.org/data3'] = 'söme dätä 3';
        window.localStorage['JSONCache time http://example.org/data3'] = '1003';

        JSONCache.purgeOldest();

        eq(window.localStorage.length, 4, 'There should be four items in localStorage.');
        eq(window.localStorage['JSONCache data http://example.org/data2'], 'söme dätä 2',
           'Correct data should be in localStorage.');
        eq(window.localStorage['JSONCache time http://example.org/data2'], '1002',
           'Correct data should be in localStorage.');
        eq(window.localStorage['JSONCache data http://example.org/data3'], 'söme dätä 3',
           'Correct data should be in localStorage.');
        eq(window.localStorage['JSONCache time http://example.org/data3'], '1003',
           'Correct data should be in localStorage.');
    });
    test('Test oldest item removing with several items (including non JSONCache items).', function () {
        expect(6);
        eq(window.localStorage.length, 0, 'localStorage should be empty in the beginning.');

        window.localStorage['JSONCache data http://example.org/data1'] = 'söme dätä 1';
        window.localStorage['JSONCache time http://example.org/data1'] = '1001';
        window.localStorage['JSONCache data http://example.org/data2'] = 'söme dätä 2';
        window.localStorage['JSONCache time http://example.org/data2'] = '1002';
        window.localStorage['JSONCache data http://example.org/data3'] = 'söme dätä 3';
        window.localStorage['JSONCache time http://example.org/data3'] = '1003';

        window.localStorage['öther key 1'] = 'öther dätä 1';
        window.localStorage['öther key 2'] = 'öther dätä 2';

        // Clear two oldest items.
        JSONCache.purgeOldest();
        JSONCache.purgeOldest();

        eq(window.localStorage.length, 4, 'There should be four items in localStorage.');
        eq(window.localStorage['JSONCache data http://example.org/data3'], 'söme dätä 3',
           'Correct data should be in localStorage.');
        eq(window.localStorage['JSONCache time http://example.org/data3'], '1003',
           'Correct data should be in localStorage.');
        eq(window.localStorage['öther key 1'], 'öther dätä 1',
           'Correct data should be in localStorage.');
        eq(window.localStorage['öther key 2'], 'öther dätä 2',
           'Correct data should be in localStorage.');
    });

    test('Default numTries in settings.', function () {
        expect(1);
        eq(JSONCache.settings.numTries, 5, 'Default tryCount value should be 5.');
    });

    asyncTest('Timeout for all fetching tries.', function () {
        expect(2);

        // Set shorter wait time for faster tests.
        JSONCache.settings.waitTime = 10;

        // Mock the proxy function to always time out.
        var proxyCallCount = 0;
        JSONCache._getJSONProxy = function (url, options) {
            proxyCallCount++;
            window.setTimeout(function () {
                options.error(null, 'timeout', null);
            }, 10);
        };

        JSONCache.getCachedJSON('data.json', {
            ongiveup: function (status) {
                eq(status, 'timeout', 'Error status should be correct.');
                eq(proxyCallCount, 5, 'Proxy function should be called 5 times.');
                start();
            }
        });

    });
    asyncTest('Timeout for all fetching tries with changed number of tries.', function () {
        expect(3);

        // Set shorter wait time for faster tests.
        JSONCache.settings.waitTime = 10;
        JSONCache.settings.numTries = 6;

        // Mock the proxy function to always time out.
        var proxyCallCount = 0;
        JSONCache._getJSONProxy = function (url, options) {
            proxyCallCount++;
            window.setTimeout(function () {
                options.error(null, 'timeout', null);
            }, 10);
        };

        var retryArgs = [];
        var ontry = function (tryNumber) {
            retryArgs.push(tryNumber);
        };

        JSONCache.getCachedJSON('data.json', {
            ontry: ontry,
            ongiveup: function (status) {
                eq(status, 'timeout', 'Error status should be correct.');
                eq(proxyCallCount, 6, 'Proxy function should be called the correct amount of times.');
                deepEqual(retryArgs, [1, 2, 3, 4, 5, 6],
                          'The retry hook function should be called before each try.');
                start();
            }
        });
    });
    asyncTest('Error hook calling.', function () {
        expect(4);

        JSONCache.settings.waitTime = 10;

        // Mock the proxy function to always time out.
        var proxyCallCount = 0;
        JSONCache._getJSONProxy = function (url, options) {
            proxyCallCount++;
            window.setTimeout(function () {
                options.error(null, 'timeout', null);
            }, 10);
        };

        var errorCallCount = 0;
        var errorArgs = [];
        var onerror = function (jqXHR, textStatus, errorThrown, tryNumber) {
            errorCallCount++;
            errorArgs.push(textStatus + ' ' + tryNumber);
        };

        JSONCache.getCachedJSON('data.json', {
            onerror: onerror,
            ongiveup: function (status) {
                eq(status, 'timeout', 'Error status should be correct.');
                eq(proxyCallCount, 5, 'Proxy function should be called the correct amount of times.');
                eq(errorCallCount, 5, 'Error function should be called the correct amount of times.');
                deepEqual(errorArgs, ['timeout 1', 'timeout 2', 'timeout 3', 'timeout 4', 'timeout 5'],
                          'The error hook function should be called on every error.');
                start();
            }
        });
    });

    asyncTest('Trying to get an expired item from the cache.', function () {
        expect(3);

        eq(window.localStorage.length, 0, 'localStorage should be empty initially.');

        var proxyCallCount = 0;
        JSONCache._getJSONProxy = function (url, options) {
            proxyCallCount++;
            if (url === 'data.json') {
                options.success(testData);
            }
        };
        JSONCache._getTime = function () {
            return 2345678901234;
        };

        // Expired one millisecond.
        var lifetime = 5 * 60 * 1000;
        var time = 2345678901234 - lifetime - 1;

        window.localStorage['JSONCache data data.json'] = '{"data":"öld invalid dätä"}';
        window.localStorage['JSONCache time data.json'] = time;

        JSONCache.getCachedJSON('data.json', {
            success: function (data) {
                deepEqual(data, {
                    "success": true,
                    "data": [
                        "först item",
                        "secönd itém"
                    ],
                    "Weird väl": 666
                }, 'Returned data should be correct.');
                eq(proxyCallCount, 1, 'Proxy function should be called once.');
                start();
            }
        });
    });

    test('Cache clean with empty cache.', function () {
        expect(2);
        eq(window.localStorage.length, 0, 'localStorage should be empty initially.');
        JSONCache.clean();
        eq(window.localStorage.length, 0, 'localStorage should be empty in the end.');
    });
    test('Cache clean with only valid items.', function () {
        expect(7);
        eq(window.localStorage.length, 0, 'localStorage should be empty initially.');

        JSONCache._getTime = function () {
            return 2345678901234;
        };

        window.localStorage['JSONCache data data1'] = '{"data":"dätä 1"}';
        window.localStorage['JSONCache time data1'] = '2345678901234';

        window.localStorage['JSONCache data data2'] = '{"data":"dätä 2"}';
        window.localStorage['JSONCache time data2'] = (2345678901234 - 5 * 60 * 1000).toString();

        window.localStorage['söme öther key'] = 'söme öther dätä';

        JSONCache.clean();

        eq(window.localStorage.length, 5, 'All items should still be in the cache.');
        eq(window.localStorage['JSONCache data data1'], '{"data":"dätä 1"}',
           'Correct data should still be in the cache.');
        eq(window.localStorage['JSONCache time data1'], '2345678901234',
           'Correct data should still be in the cache.');
        eq(window.localStorage['JSONCache data data2'], '{"data":"dätä 2"}',
           'Correct data should still be in the cache.');
        eq(window.localStorage['JSONCache time data2'], (2345678901234 - 5 * 60 * 1000).toString(),
           'Correct data should still be in the cache.');
        eq(window.localStorage['söme öther key'], 'söme öther dätä',
           'Correct data should still be in the cache.');
    });
    test('Cache clean with only expired items.', function () {
        expect(2);
        eq(window.localStorage.length, 0, 'localStorage should be empty initially.');

        JSONCache._getTime = function () {
            return 2345678901234;
        };

        window.localStorage['JSONCache data data1'] = '{"data":"dätä 1"}';
        window.localStorage['JSONCache time data1'] = '1234567890123';

        window.localStorage['JSONCache data data2'] = '{"data":"dätä 2"}';
        // Expired 1 millisecond.
        window.localStorage['JSONCache time data2'] = (2345678901234 - 5 * 60 * 1000 - 1).toString();

        JSONCache.clean();

        eq(window.localStorage.length, 0, 'Cache should be empty.');
    });
    test('Cache clean with valid and expired items.', function () {
        expect(7);
        eq(window.localStorage.length, 0, 'localStorage should be empty initially.');

        JSONCache._getTime = function () {
            return 2345678901234;
        };

        window.localStorage['JSONCache data data1'] = '{"data":"dätä 1"}';
        window.localStorage['JSONCache time data1'] = '1234567890123';

        window.localStorage['JSONCache data data2'] = '{"data":"dätä 2"}';
        // Expired 1 millisecond.
        window.localStorage['JSONCache time data2'] = (2345678901234 - 5 * 60 * 1000 - 1).toString();

        window.localStorage['JSONCache data data3'] = '{"data":"dätä 3"}';
        window.localStorage['JSONCache time data3'] = '2345678901234';

        window.localStorage['JSONCache data data4'] = '{"data":"dätä 4"}';
        window.localStorage['JSONCache time data4'] = (2345678901234 - 5 * 60 * 1000).toString();

        window.localStorage['söme öther key'] = 'söme öther dätä';

        JSONCache.clean();

        eq(window.localStorage.length, 5, 'Valid items should still be in the cache.');
        eq(window.localStorage['JSONCache data data3'], '{"data":"dätä 3"}',
           'Correct data should still be in the cache.');
        eq(window.localStorage['JSONCache time data3'], '2345678901234',
           'Correct data should still be in the cache.');
        eq(window.localStorage['JSONCache data data4'], '{"data":"dätä 4"}',
           'Correct data should still be in the cache.');
        eq(window.localStorage['JSONCache time data4'], (2345678901234 - 5 * 60 * 1000).toString(),
           'Correct data should still be in the cache.');
        eq(window.localStorage['söme öther key'], 'söme öther dätä',
           'Correct data should still be in the cache.');
    });

}(jQuery));
