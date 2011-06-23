=========
JSONCache
=========

JSONCache is a caching layer for fetching JSON data with jQuery. It
uses HTML5's window.localStorage to cache fetched JSON data to avoid
unnecessary network requests.

Usage
-----

::

    JSONCache.getCachedJSON({
        url: 'http://example.com/data.json',
        success: function (data) {
            // handle data
        }
    });
