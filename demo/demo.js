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

	var $console = $('#jc-console');
	var $fetch = $('#jc-fetch');
	var $clear = $('#jc-clear');
	var $resetConsole = $('#jc-resetConsole');
	var consoleContentHeight = 0;

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
	$fetch.click(function() {

		var url = 'data.json';
		var date = new Date();

		JSONCache.getCachedJSON(url, {
			success: function(data) {
				var timeDelta = new Date().getTime() - date.getTime();
				log(timeDelta + ' ms => ' + JSON.stringify(data), 'success');
			},
			retryHook: function(tryNumber) {
				log('Fetching, try #' + tryNumber + ' for "' + url + '"');
			},
			errorHook: function(jqXHR, textStatus, errorThrown, tryNumber) {
				log('Failed on try #' + tryNumber, 'error');
			}
		});

	});

	// Clears the entire cache.
	$clear.click(function() {

		JSONCache.clear();

		log('JSONCache cleared');

	});

	// Resets the "console" on the page.
	$resetConsole.click(function() {

		$console.html('');
		consoleContentHeight = 0;

	});

	// Synchronize the range inputs with their related outputs etc.
	$('#jc-settings input[type=range]').each(function() {

		if (this.name in JSONCache.settings)
			this.value = JSONCache.settings[this.name];

	}).change(function() {

		var val = Math.round(this.value * 10) / 10;

		$('#jc-settings output[for=' + this.id + ']').val(val);

		JSONCache.settings[this.name] = parseFloat(this.value, 10);

	}).change();

	// Tell the user we're ready.
	log('Welcome to the JSONCache Test Drive App!');

});