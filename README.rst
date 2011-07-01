=========
JSONCache
=========

JSONCache is a caching layer for fetching JSON data with jQuery. It
uses HTML5's window.localStorage to cache fetched JSON data to avoid
unnecessary network requests.

The primary goal of the library is to minimize network requests for
mobile devices.

Requirements
------------

- jQuery (versions ?)

- JSON.parse and JSON.stringify (available in the latest browsers or
  e.g. with json2.js available at
  https://github.com/douglascrockford/JSON-js)

- window.localStorage (available in the latest browsers)

Usage
-----

1. Make sure you have all the requirements.

2. Download the minified jsoncache-{version}.min.js file and include
   it on your page:

3. Use the JSONCache.getCachedJSON function instead of jQuery.getJSON
   to fetch your data:

JSONCache.getCachedJSON attempts to provide the same API as the
jQuery.ajax function.

::

    JSONCache.getCachedJSON('http://example.com/data.json', {
        success: function (data) {
            // handle data
        }
    });

Testing
-------

JSONCache uses QUnit as its test framework. The tests can be run by
opening the `tests/index.html` in the browser that you want to test
the library in, and selecting either the development version or the
production (minified) version tests.

More about QUnit: http://docs.jquery.com/Qunit

TODO
----

- Removing old entries based on cache size.
  - Have to keep track of the cache size.
  - Remove oldest entries based on timestamp.
- Add support for trying to fetch the requested resource (not in
  cache) multiple times to delay errors with small network
  interrruptions.
