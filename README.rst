=========
JSONCache
=========

JSONCache is a caching layer for fetching JSON data with jQuery. It
uses HTML5's window.localStorage to cache fetched JSON data to avoid
unnecessary network requests.

The primary goal of the library is to minimize network requests for
mobile devices.

Licence
-------

JSONCache is Licenced under the MIT licence. See LICENCE file for more
information.

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

Basic example:

::

    JSONCache.getCachedJSON('http://example.com/data.json', {
        success: function (data) {
            // handle data
        }
    });

Example with error hooks to display status info to user:

::

    // Message container to show info to user.
    var message = $('#message');

    JSONCache.getCachedJSON(
        onerror: function (jqXHR, textStatus, errorThrown, tryNumber) {
            message.text('Failed fetch number ' + tryNumber + '. Trying again...');
        },
        ongiveup: function (status) {
            message.text('Network failure, cannot fetch data.');
        },
        success: function (data) {
            message.text('Data fetched successfully!');
        }
    );

Testing
-------

JSONCache test suite uses Jasmine (
https://github.com/pivotal/jasmine/wiki ) for its test framework. The
tests can be run by typing:

::

    make test # for dev and production
    make test_dev # for dev
    make test_prop # for production

The command line test runner uses PhantomJS (
http://www.phantomjs.org/ ). The tests can also be run by opening the
`tests/index.html` in a browser and clicking on the jasmine test
links.

Old QUnit tests are still available in the same index.html.

TODO
----

- Removing old entries based on cache size.

  - Have to keep track of the cache size.

  - Remove oldest entries based on timestamp.

  - Catch browser quota errors (only supported on some browsers.)

- Add better support for user defined error handling.
