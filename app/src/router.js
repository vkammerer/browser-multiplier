/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var purl = require('purl');
	var $ = require('jquery');

	/* Pub / Sub manager */

	var $body = $('body');

	/* Router */

	var init = function() {

		var thisPurl = purl(window.location.href);

		var settings = {
			siteUrl : thisPurl.param('siteUrl'),
			siteContentSelector : thisPurl.param('siteContentSelector'),
			siteWidth : thisPurl.param('siteWidth'),
			siteBackground : thisPurl.param('siteBackground')
		};

		if (settings.siteUrl) {
			$body.trigger('settings', settings);
		}

	};

	return {
		init: init
	};

});
