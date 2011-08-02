/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global beforeEach: false, describe: false, it: false, expect: false,
  spyOn: false, jQuery: false, JSONCache: false, window: false,
  waitsFor: false, runs: false, jasmine: false */

describe('JSONCache Test Suite.', function () {

    "use strict"; // trigger ECMAScript 5 Strict Mode

    var testData;
    var _numTries = JSONCache.settings.numTries;
    var _waitTime = JSONCache.settings.waitTime;
    var _itemLifetime = JSONCache.settings.itemLifetime;

    beforeEach(function () {
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
        JSONCache.settings.numTries = _numTries;
        JSONCache.settings.waitTime = _waitTime;
        JSONCache.settings.itemLifetime = _itemLifetime;
    });

    // Environment requirements:

    it('should satisfy the requirements', function () {

        // Browser APIs.
        expect(window).toBeDefined();
        expect(JSON).toBeDefined();
        expect(typeof JSON.parse).toBe('function');
        expect(typeof JSON.stringify).toBe('function');
        expect(window.localStorage).toBeDefined();
        expect(window.localStorage).not.toBeNull();
        expect(window.localStorage.length).toBe(0);

        // Libraries.
        expect(typeof jQuery).toBe('function');

        // The JSONCache library itself.
        expect(typeof JSONCache).toBe('object');
        expect(typeof JSONCache.getCachedJSON).toBe('function');
        expect(typeof JSONCache._getJSONProxy).toBe('function');
        expect(typeof JSONCache._getTime).toBe('function');
        expect(typeof JSONCache._tryGetJSON).toBe('function');

        // JSONCache settings and default values.
        expect(typeof JSONCache.settings).toBe('object');
        expect(JSONCache.settings.numTries).toBe(5);
        expect(JSONCache.settings.waitTime).toBe(200);
        expect(JSONCache.settings.itemLifetime).toBe(5 * 60 * 1000);
    });
    it('should have the basic localStorage functionality', function () {
        expect(window.localStorage.length).toBe(0);
        window.localStorage['söme key'] = 'söme dätä';
        expect(window.localStorage.length).toBe(1);
        expect(window.localStorage['söme key']).toBe('söme dätä');
    });

    // Basic functionality:

    it('should return correct data and cache it', function () {

        // Mock the proxy and time functions.
        spyOn(JSONCache, '_getJSONProxy').andCallFake(function (url, options) {
            options.success(testData);
        });
        spyOn(JSONCache, '_getTime').andReturn(2345678901234);

        var done = false;
        var returnedData;
        JSONCache.getCachedJSON('data.json', {
            success: function (data) {
                returnedData = data;
                done = true;
            }
        });

        waitsFor(function () {
            return done;
        }, 'Ajax success function', 10000);
        runs(function () {
            expect(returnedData).toEqual({
                success: true,
                data: [
                    'först item',
                    'secönd itém'
                ],
                'Weird väl': 666
            });
            expect(returnedData).toEqual(JSON.parse(window.localStorage['JSONCache data data.json']));
            expect(window.localStorage['JSONCache time data.json']).toBe('2345678901234');
            expect(JSONCache._getJSONProxy.callCount).toBe(1);
            expect(JSONCache._getJSONProxy.mostRecentCall.args[0]).toBe('data.json');
            expect(JSONCache._getTime.callCount).toBe(1);
            expect(window.localStorage.length).toBe(3);
        });
    });
    it('should allow calls without a success handler', function () { // usage example: for warming up the cache without acting on the responses (yet)
        // Mock the proxy function.
        spyOn(JSONCache, '_getJSONProxy').andCallFake(function (url, options) {
            options.success(testData);
        });

        JSONCache.getCachedJSON('data.json');
    });
    it('should allow calls without a success handler that return from the cache', function () {
        // Mock the proxy function.
        spyOn(JSONCache, '_getJSONProxy').andCallFake(function (url, options) {
            options.success(testData);
        });

        JSONCache.getCachedJSON('data.json');
        JSONCache.getCachedJSON('data.json');
    });

    // JSONCache.clear:

    it('should not fail trying to clear an item from an empty cache', function () {
        expect(window.localStorage.length).toBe(0);
        JSONCache.clear('http://example.org/key?param1=a%20b+c#hash-123');
        expect(window.localStorage.length).toBe(0);
    });
    it('should not fail trying to clear an empty cache', function () {
        expect(window.localStorage.length).toBe(0);
        JSONCache.clear();
        expect(window.localStorage.length).toBe(0);
    });
    it('should clear a certain item from the cache', function () {
        expect(window.localStorage.length).toBe(0);

        var dataKey = 'JSONCache data http://example.org/key?param1=a%20b+c#hash-123';
        var timeKey = 'JSONCache time http://example.org/key?param1=a%20b+c#hash-123';
        window.localStorage[dataKey] = 'my dätä';
        window.localStorage[timeKey] = '123';

        window.localStorage['öther kéy'] = 'öther dätä';

        // Remove a certain item from the cache.
        JSONCache.clear('http://example.org/key?param1=a%20b+c#hash-123');

        expect(window.localStorage.length).toBe(1);
        expect(window.localStorage['öther kéy']).toBe('öther dätä');
    });
    it('should clear correct items when whole cache is cleared', function () {
        expect(window.localStorage.length).toBe(0);

        var dataKey = 'JSONCache data http://example.org/key?param1=a%20b+c#hash-123';
        var timeKey = 'JSONCache time http://example.org/key?param1=a%20b+c#hash-123';
        window.localStorage[dataKey] = 'my dätä';
        window.localStorage[timeKey] = '123';

        window.localStorage['JSONCache data http://example.org/data'] = 'my dätä 2';
        window.localStorage['JSONCache time http://example.org/time'] = '1234';

        window.localStorage['öther kéy'] = 'öther dätä';

        // Clear the whole cache.
        JSONCache.clear();

        expect(window.localStorage.length).toBe(1);
        expect(window.localStorage['öther kéy']).toBe('öther dätä');
    });

    // JSONCache.purgeOldest:

    it('should not fail trying to purge with an empty cache', function () {
        expect(window.localStorage.length).toBe(0);
        JSONCache.purgeOldest();
        expect(window.localStorage.length).toBe(0);
    });
    it('should remove the only item in the cache', function () {
        expect(window.localStorage.length).toBe(0);

        window.localStorage['JSONCache data http://example.org/data'] = 'söme dätä';
        window.localStorage['JSONCache time http://example.org/data'] = '123';

        JSONCache.purgeOldest();
        expect(window.localStorage.length).toBe(0);
    });
    it('should only remove the oldest item with several items in the cache', function () {
        expect(window.localStorage.length).toBe(0);

        window.localStorage['JSONCache data http://example.org/data1'] = 'söme dätä 1';
        window.localStorage['JSONCache time http://example.org/data1'] = '1001';
        window.localStorage['JSONCache data http://example.org/data2'] = 'söme dätä 2';
        window.localStorage['JSONCache time http://example.org/data2'] = '1002';
        window.localStorage['JSONCache data http://example.org/data3'] = 'söme dätä 3';
        window.localStorage['JSONCache time http://example.org/data3'] = '1003';

        JSONCache.purgeOldest();

        expect(window.localStorage.length).toBe(4);
        expect(window.localStorage['JSONCache data http://example.org/data2']).toBe('söme dätä 2');
        expect(window.localStorage['JSONCache time http://example.org/data2']).toBe('1002');
        expect(window.localStorage['JSONCache data http://example.org/data3']).toBe('söme dätä 3');
        expect(window.localStorage['JSONCache time http://example.org/data3']).toBe('1003');
    });
    it('should remove oldest items with several calls and other items in the cache', function () {
        expect(window.localStorage.length).toBe(0);

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

        expect(window.localStorage.length).toBe(4);
        expect(window.localStorage['JSONCache data http://example.org/data3']).toBe('söme dätä 3');
        expect(window.localStorage['JSONCache time http://example.org/data3']).toBe('1003');
        expect(window.localStorage['öther key 1']).toBe('öther dätä 1');
        expect(window.localStorage['öther key 2']).toBe('öther dätä 2');
    });

    // Error and hooks handling:

    it('should call ontry exactly once on a successful get', function () {

        // Mock the proxy.
        spyOn(JSONCache, '_getJSONProxy').andCallFake(function (url, options) {
            window.setTimeout(function () {
                options.success(testData);
            }, 1);

        });

        var done = false;
        var numTries = 0;

        JSONCache.getCachedJSON('data.json', {
            success: function () {
                done = true;
            },
            ontry: function () {
                numTries++;
            }
        });

        waitsFor(function () {
            return done;
        }, 'ongiveup function', 10000);
        runs(function () {
            expect(numTries).toBe(1);
        });
    });
    it('should call ongiveup if all requests time out', function () {

        // Make the waiting time shorter for faster tests.
        JSONCache.settings.waitTime = 2;

        expect(JSONCache.settings.numTries).toBe(5);

        // Mock the proxy to always time out.
        spyOn(JSONCache, '_getJSONProxy').andCallFake(function (url, options) {
            window.setTimeout(function () {
                options.error(null, 'timeout', null);
            }, 2);
        });

        var done = false;
        var returnedStatus;

        JSONCache.getCachedJSON('data.json', {
            ongiveup: function (status) {
                done = true;
                returnedStatus = status;
            }
        });

        waitsFor(function () {
            return done;
        }, 'ongiveup function', 10000);
        runs(function () {
            expect(returnedStatus).toBe('timeout');
            expect(JSONCache._getJSONProxy.callCount).toBe(5);
        });
    });
    it('should call ongiveup, and ontry with changed number of tries', function () {

        JSONCache.settings.waitTime = 10;
        JSONCache.settings.numTries = 3;

        spyOn(JSONCache, '_getJSONProxy').andCallFake(function (url, options) {
            window.setTimeout(function () {
                options.error(null, 'timeout', null);
            }, 10);
        });

        var done = false;
        var returnedStatus;

        var ontry = jasmine.createSpy();

        JSONCache.getCachedJSON('data.json', {
            ontry: ontry,
            ongiveup: function (status) {
                done = true;
                returnedStatus = status;
            }
        });

        waitsFor(function () {
            return done;
        }, 'ongiveup function', 10000);
        runs(function () {
            expect(returnedStatus).toBe('timeout');
            expect(JSONCache._getJSONProxy.callCount).toBe(3);
            expect(ontry.callCount).toBe(3);
            expect(ontry.argsForCall).toEqual([[1], [2], [3]]);
        });
    });
    it('should not call ongiveup when first requests fail but last one succeeds', function () {

        JSONCache.settings.waitTime = 10;
        JSONCache.settings.numTries = 3;

        var tryNum = 1;

        spyOn(JSONCache, '_getJSONProxy').andCallFake(function (url, options) {
            window.setTimeout(function () {
                if (tryNum++ < JSONCache.settings.numTries) {
                    options.error(null, 'timeout', null);
                } else {
                    options.success(testData);
                }
            }, 1);
        });

        var done = false;
        var gaveUp = false;

        JSONCache.getCachedJSON('data.json', {
            success: function () {
                done = true;
            },
            ongiveup: function () {
                gaveUp = true;
            }
        });

        waitsFor(function () {
            return done;
        }, 'success function', 1000);
        runs(function () {
            expect(gaveUp).toBeFalsy();
        });
    });
    it('should call the onerror callback properly', function () {

        JSONCache.settings.waitTime = 10;

        spyOn(JSONCache, '_getJSONProxy').andCallFake(function (url, options) {
            window.setTimeout(function () {
                options.error(null, 'timeout', null);
            }, 10);
        });

        var onerror = jasmine.createSpy();
        var done = false;
        var returnedStatus;

        JSONCache.getCachedJSON('data.json', {
            onerror: onerror,
            ongiveup: function (status) {
                done = true;
                returnedStatus = status;
            }
        });

        waitsFor(function () {
            return done;
        }, 'ongiveup function', 10000);
        runs(function () {
            expect(returnedStatus).toBe('timeout');
            expect(JSONCache._getJSONProxy.callCount).toBe(5);
            expect(onerror.callCount).toBe(5);
            expect(onerror.argsForCall).toEqual([
                [null, 'timeout', null, 1],
                [null, 'timeout', null, 2],
                [null, 'timeout', null, 3],
                [null, 'timeout', null, 4],
                [null, 'timeout', null, 5]
            ]);
        });
    });

    // Expiration handling:

    it('should not return an expired item from the cache', function () {
        expect(window.localStorage.length).toBe(0);

        spyOn(JSONCache, '_getJSONProxy').andCallFake(function (url, options) {
            window.setTimeout(function () {
                options.success(testData);
            });
        });
        spyOn(JSONCache, '_getTime').andReturn(2345678901234);

        var lifetime = 5 * 60 * 1000;
        var time = 2345678901234 - lifetime - 1;

        window.localStorage['JSONCache data data.json'] = '{"data":"öld invalid dätä"}';
        window.localStorage['JSONCache time data.json'] = time;

        var done = false;
        var returnedData;

        JSONCache.getCachedJSON('data.json', {
            success: function (data) {
                done = true;
                returnedData = data;
            }
        });

        waitsFor(function () {
            return done;
        });
        runs(function () {
            expect(returnedData).toEqual({
                success: true,
                data: [
                    'först item',
                    'secönd itém'
                ],
                'Weird väl': 666
            });
            expect(JSONCache._getJSONProxy.callCount).toBe(1);
        });
    });

    // JSONCache.clean:

    it('should not fail cleaning an empty cache', function () {
        expect(window.localStorage.length).toBe(0);
        JSONCache.clean();
        expect(window.localStorage.length).toBe(0);
    });
    it('should not clean valid items', function () {
        expect(window.localStorage.length).toBe(0);

        spyOn(JSONCache, '_getTime').andReturn(2345678901234);

        window.localStorage['JSONCache data data1'] = '{"data":"dätä 1"}';
        window.localStorage['JSONCache time data1'] = '2345678901234';
        window.localStorage['JSONCache data data2'] = '{"data":"dätä 2"}';
        window.localStorage['JSONCache time data2'] = (2345678901234 - 5 * 60 * 1000).toString();
        window.localStorage['söme öther key'] = 'söme öther dätä';

        JSONCache.clean();

        expect(window.localStorage.length).toBe(5);
        expect(window.localStorage['JSONCache data data1']).toBe('{"data":"dätä 1"}');
        expect(window.localStorage['JSONCache time data1']).toBe('2345678901234');
        expect(window.localStorage['JSONCache data data2']).toBe('{"data":"dätä 2"}');
        expect(window.localStorage['JSONCache time data2']).toBe((2345678901234 - 5 * 60 * 1000).toString());
        expect(window.localStorage['söme öther key']).toBe('söme öther dätä');
    });
    it('should clean expired items', function () {
        expect(window.localStorage.length).toBe(0);

        spyOn(JSONCache, '_getTime').andReturn(2345678901234);

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

        expect(window.localStorage.length).toBe(5);
        expect(window.localStorage['JSONCache data data3']).toBe('{"data":"dätä 3"}');
        expect(window.localStorage['JSONCache time data3']).toBe('2345678901234');
        expect(window.localStorage['JSONCache data data4']).toBe('{"data":"dätä 4"}');
        expect(window.localStorage['JSONCache time data4']).toBe((2345678901234 - 5 * 60 * 1000).toString());
        expect(window.localStorage['söme öther key']).toBe('söme öther dätä');
    });

    // Cache size tracking:

    describe('Cache size tracking', function() {

        var timestamp = 2345678900000;
        var responses = [];

        beforeEach(function() {

            expect(window.localStorage.length).toBe(0);
            expect(window.localStorage['JSONCache size']).toBeUndefined();

            spyOn(JSONCache, '_getJSONProxy').andCallFake(function (url, options) {
                if (responses.length > 0) {
                    options.success(responses.shift());
                } else {
                    throw new Error('Array of fake responses exhausted unexpectedly');
                }
            });

            spyOn(JSONCache, '_getTime').andCallFake(function() {
                return timestamp += 100;
            });

        });

        it('should update cache size automatically on single add', function() {

            responses = [ 'abc' ];

            JSONCache.getCachedJSON('data.json');

            expect(window.localStorage['JSONCache size']).toBe('10'); // == len('"abc"') * 2

        });
        it('should update cache size automatically on multiple adds', function() {

            responses = [ 'a', 'ab', 'abc' ];

            JSONCache.getCachedJSON('data1.json');
            JSONCache.getCachedJSON('data2.json');
            JSONCache.getCachedJSON('data3.json');

            expect(window.localStorage['JSONCache size']).toBe('24'); // == ( len('"a"') + len('"ab"') + len('"abc"') ) * 2

        });
        it('should NOT increase cache size counter when not actually adding anything', function() {

            responses = [ 'abc', 'xyz' ];

            JSONCache.getCachedJSON('data.json');
            JSONCache.getCachedJSON('data.json'); // this should not add cache size as it produces a cache hit

            expect(window.localStorage['JSONCache size']).toBe('10'); // == len('"abc"') * 2

        });
        xit('should evict older entries when cache size grows beyond its limits', function() {
            // TODO
        });

    });

});
