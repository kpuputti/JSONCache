=========
JSONCache
=========

JSONCache is a caching layer for fetching JSON data with jQuery. It
uses HTML5's window.localStorage to cache fetched JSON data to avoid
unnecessary network requests.

Requirements
------------

- jQuery (versions ?)

- JSON.parse and JSON.stringify (available in the latest browsers or
  e.g. with json2.js available at
  https://github.com/douglascrockford/JSON-js)

Usage
-----

1. Make sure you have all the requirements.

2. Download the minified jsoncache-{version}.min.js file and include
   it on your page:

3. Use the JSONCache.getCachedJSON function instead of jQuery.getJSON
   to fetch your data:

::

    JSONCache.getCachedJSON({
        url: 'http://example.com/data.json',
        success: function (data) {
            // handle data
        }
    });
