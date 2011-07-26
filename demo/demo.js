$(function() {

	"use strict"; // trigger ECMAScript 5 Strict Mode

	var $console = $('#jc-console');
	var $fetch = $('#jc-fetch');
	var consoleContentHeight = 0;

	// Overrides the default $.ajax delegation to allow fiddling with the responses.
	JSONCache._getJSONProxy = function (url, options) {
        $.ajax(url, options);
    };

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

	// Fetches content from the server using JSONCache.getCachedJSON().
	$fetch.click(function() {

		log("Fetching 'data.json' from server...");

		$.ajax({
			url: 'data.json?' + new Date().getTime(),
			dataType: 'json',
			success: function(data, textStatus, jqXHR) {
				log(JSON.stringify(data), 'success');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				log(textStatus, 'error');
			}
		});

	});

});