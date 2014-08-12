/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var $ = require('jquery');

	var browserBarHeight = 65;

	/* Styler */

	var Styler = function() {
		this.jQueryElement = $('#styler');
	};

	Styler.prototype.set = function(settings) {

		var browserHeight = $('body').height() - 2 * settings.interfacePadding;
		var iframeHeight = browserHeight - browserBarHeight;

		this.jQueryElement.html([
			'body {background:' + settings.siteBackground + ';} ',
			'.iframeContainer, iframe {height:' + iframeHeight + 'px;} '
		].join(''));

	};

	return Styler;

});
