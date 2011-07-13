/*jslint white: true, devel: true, onevar: false, undef: true, nomen: false,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global describe: false, it: false, expect: false,
  jQuery: false, JSONCache: false, window: false */

describe('JSONCache Test Suite.', function () {

    it('should satisfy the requirements', function () {

        // Browser APIs.
        expect(window).toBeDefined();
        expect(JSON).toBeDefined();
        expect(typeof JSON.parse).toBe('function');
        expect(typeof JSON.stringify).toBe('function');
        expect(window.localStorage).toBeDefined();
        expect(window.localStorage).not.toBeNull();

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

});
