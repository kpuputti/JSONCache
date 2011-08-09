/**
 * This is the interactive test drive application for JSONCache.
 * It allows the user to have a play around with the features and
 * settings offered by the library.
 *
 * @preserve JSONCache version #VERSION#
 *
 * Author: Jarno Rantanen (first.last@futurice.com)
 *
 * See README.rst at https://github.com/kpuputti/JSONCache
 * for requirements and usage.
 */
/*global $, JSONCache, window */

$(function() {

	"use strict"; // trigger ECMAScript 5 Strict Mode

	var $console = $('#jc-console ol');
	var $clear = $('#jc-clear');
	var $resetConsole = $('#jc-resetConsole');
	var $inputs = $('#jc-settings input[type=range]');
	var consoleContentHeight = 0;

	if (!Modernizr.inputtypes.range) // range input not supported by UA
		$(document.body).addClass('jc-noRangeInput');

	// Left-pads the given string with zeroes to the given length.
	var pad = function(str, length) {
		str = '' + str;
		length = length || 2;
		while (str.length < length)
			str = '0' + str;
		return str;
	};

	// Adds an entry to the "console" on the page.
	var log = function(message, type) {

		var d = new Date();

		var $li = $('<li />');
		$li.addClass('jc-' + (type || 'neutral'));

		var $ts = $('<span class="jc-timestamp"></span>');
		$ts.text(pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + '.' + pad(d.getMilliseconds(), 3) + ' ');

		var $msg = $('<span class="jc-message"></span>');
		$msg.text(message);

		$console.append($li.append($ts, $msg));

		consoleContentHeight += $li.outerHeight();
		$console.scrollTop(Math.max(0, consoleContentHeight - $console.height()));

	};

	// Overrides the default $.ajax delegation to allow fiddling with the responses.
	JSONCache._getJSONProxy = function (url, options) {
		if (Math.random() > JSONCache.settings.successProb)
			window.setTimeout(function() {
				options.error(null, 'error', null);
			}, 1);
		else
			$.ajax(url + '?' + new Date().getTime(), options); // the timestamp in the query string will bypass any browser caches
    };

	// Fetches content from the server using JSONCache.getCachedJSON().
	var fetch = function(url) {

		var date = new Date();

		JSONCache.getCachedJSON(url, {
			success: function(data) {
				var timeDelta = new Date().getTime() - date.getTime();
				log(timeDelta + ' ms => "' + url + '"', 'success');
			},
			ontry: function(tryNumber) {
				log('Fetching, try #' + tryNumber + ' for "' + url + '"');
			},
			onerror: function(jqXHR, textStatus, errorThrown, tryNumber) {
				log('Error, on try #' + tryNumber);
			},
			ongiveup: function(textStatus) {
				log('Giving up: ' + textStatus, 'error');
			}
		});

	};

	// Triggers the small fetch.
	$('#jc-fetchSmall').click(function() {
		fetch('small.json');
	});

	// Triggers the large fetch.
	$('#jc-fetchBig').click(function() {
		fetch('big.json');
	});

	// Clears the entire cache.
	$clear.click(function() {

		JSONCache.clear();

		log('JSONCache cleared');

	});

    // Dumps some statistics out of JSONCache.
    $('#jc-dumpStats').click(function() {

        var padLeft = function(string, toLen) {

            string = '' + string;
            toLen = toLen || 10;

            while (string.length < toLen) {
                string = ' ' + string;
            }

            return string;

        };

        var actualSize = 0;
        var keysUsed = 0;

        (function() {

            var dataKeyRe = /^JSONCache data /;
            var key;
            var len = window.localStorage.length;

            for (var i = 0; i < len; ++i) {
                key = window.localStorage.key(i);
                if (dataKeyRe.test(key)) {
                    actualSize += window.localStorage[key].length;
                    keysUsed += 2;
                }
            }

            if (keysUsed > 0)
                keysUsed++; // take the KEY_SIZE_TOTAL-key into account

            actualSize *= 2; // assume 2-byte wide characters

        })();

        var cacheLimited = typeof JSONCache.settings.maxCacheSize === 'number';

        log('Cache max size:       ' + (cacheLimited ? padLeft(JSONCache.settings.maxCacheSize) + ' bytes' : padLeft('n/a')));
        log('Cache size reported:  ' + padLeft(JSONCache.getCacheSize()) + ' bytes');
        log('Cache size actual:    ' + padLeft(actualSize) + ' bytes', JSONCache.getCacheSize() === actualSize ? undefined : 'error');
        log('Cache utilization:    ' + (cacheLimited ? padLeft('~' + Math.round(actualSize * 100 / JSONCache.settings.maxCacheSize)) + ' %' : padLeft('n/a')));
        log('Keys in localStorage: ' + padLeft(keysUsed));

    });

	// Resets the "console" on the page.
	$resetConsole.click(function() {

		$console.html('');
		consoleContentHeight = 0;

		log('Console reset');

	});

	var outputs = {};

	// Synchronize the inputs with their related outputs and the actual settings.
	$inputs.each(function() {

		if (this.name in JSONCache.settings)
			this.value = JSONCache.settings[this.name];

		outputs[this.id] = $('#jc-settings output[for=' + this.id + ']');

		if (!Modernizr.inputtypes.range) // range input not supported by UA
			this.type = 'number';

	}).change(function() {

		outputs[this.id].val(Math.round(this.value * 10) / 10);

		JSONCache.settings[this.name] = parseFloat(this.value, 10);

	}).change();

	// Tell the user we're ready.
	log('Welcome to the JSONCache Test Drive App!');

});