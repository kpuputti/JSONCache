/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global beforeEach: false, describe: false, it: false, expect: false,
  spyOn: false, jQuery: false, JSONCache: false, window: false,
  waitsFor: false, runs: false */

describe('JSONCache Test Suite.', function () {

    var testData;

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
    });

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
            expect(window.localStorage.length).toBe(2);
        });
    });

});
