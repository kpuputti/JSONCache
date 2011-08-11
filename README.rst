=========
JSONCache
=========

JSONCache is a caching layer for fetching JSON data with jQuery. It
uses HTML5's window.localStorage to cache fetched JSON data to avoid
unnecessary network requests.

The primary goal of the library is to minimize network requests for
mobile devices.

See also the project page at http://kpuputti.github.com/JSONCache/

Licence
-------

JSONCache is licenced under the MIT licence. See LICENCE file for more
information.

Requirements
------------

- jQuery (tested with 1.6.2)

- JSON.parse and JSON.stringify (available in the latest browsers or
  e.g. with json2.js available at
  https://github.com/douglascrockford/JSON-js)

- window.localStorage (available in the latest browsers)

Usage
-----

1. Make sure you have all the requirements.

2. Download the minified jsoncache-{version}.min.js file and include
   it on your page.

3. Use the JSONCache.getCachedJSON function instead of jQuery.getJSON
   to fetch your data.

JSONCache.getCachedJSON attempts to provide the same API as the
jQuery.ajax function.

Basic example:

::

    JSONCache.getCachedJSON('http://example.com/data.json', {
        success: function (data) {
            // handle data
        }
    });

Example with function hooks to display status info to user:

::

    // Message container to show info to user.
    var message = $('#message');

    JSONCache.getCachedJSON('http://example.com/data.json', {
        ontry: function (tryNumber) {
            // Called before each fetch attempt.
            console.log('Fetch number:', tryNumber);
        },
        onerror: function (jqXHR, textStatus, errorThrown, tryNumber) {
            // Called when jQuery.ajax fails.
            message.text('Failed fetch number ' + tryNumber + '. Trying again...');
        },
        ongiveup: function (status) {
            // Called when all fetch attemps fail.
            if (status === 'timeout') {
                message.text('Network failure, cannot fetch data.');
            } else {
                message.text('Failed to get data.');
            }
        },
        success: function (data) {
            message.text('Data fetched successfully!');
        }
    );

Configuration
-------------

Global configuration:
~~~~~~~~~~~~~~~~~~~~~

Global configuration options can be set by modifying the
``JSONCache.options`` object directly. Available options:

``JSONCache.options.debug``: (boolean) toggle console debugging

``JSONCache.options.numTries``: (number) number of times the JSON is
attempted to fetch on network errors

``JSONCache.options.waitTime``: (number) time in milliseconds to wait
after a network error before a re-try. Note that this time is doubled
after each try.

``JSONCache.options.itemLifetime``: (number) Cache item validity
lifetime in milliseconds.

``JSONCache.options.maxCacheSize``: (number) Maximum cache size in bytes
that JSONCache uses. null for unlimited size.

``JSONCache.options.autoEvict``: (boolean) Flag to indicate whether old
entries should be removed from the cache if the cache fills up.

Function hooks:
~~~~~~~~~~~~~~~

Function hooks can be given in the options object in
``JSONCache.getCachedJSON`` function call. Available hooks:

``success(data)``: Called with the requested JSON data if it was found
in the cache or successfully fetched.

``ontry(tryNumber)``: Called before each network fetch attemp. The try
counter is provided as an argument (starting from 1).

``onerror(jqXHR, textStatus, errorThrown, tryNumber)``: Called when a
fetch fails. The arguments are forwarded from the jQuery error hook in
addition to the try number.

``ongiveup(status)``: Called when all attemps fail or if there is an
error with the cache. Possible statuses are ``timeout`` when all attemps
failed and ``addfailure`` when there was a problem when adding data to
localStorage.

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
``tests/index.html`` in a browser and clicking on the jasmine test
links.

Old QUnit tests are still available in the same index.html.

TODO
----

- Add support for item-specific cache lifetime.

- Add better support for user defined error handling.

- Fail more gracefully when JSON object or localStorage are not
  supported (by bypassing the cache and just forwarding the requests
  to jQuery).

- Integrate with ``window.navigator.onLine`` if present.
