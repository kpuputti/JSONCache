/*jslint white: true, devel: true, onevar: false, undef: true, nomen: true,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global jQuery: false, module: false, test: false, expect: false,
  equals: false, window: false, ok: false */

(function ($) {

    module('JSONCache');

    test('Requirements.', function () {
        expect(4);

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

        equals(typeof window.jQuery, 'function', 'jQuery is required');
        equals(jsonSupported(), true, 'JSON is required');
        equals(localStorageSupported(), true, 'localStorage is required');
        equals(typeof window.JSONCache, 'function', 'JSONCache is required');
    });

}(jQuery));
