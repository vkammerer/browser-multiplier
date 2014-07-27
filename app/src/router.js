/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var purl = require('purl');
	var $ = require('jquery');

	/* Pub / Sub manager */

	var $body = $('body');

	/* Router */

	var init = function() {

		var vkPurl = purl(window.location.href);

		var thisConfig = {
			siteUrl : vkPurl.param('siteUrl'),
			siteContentSelector : vkPurl.param('siteContentSelector'),
			siteWidth : vkPurl.param('siteWidth'),
			siteBackground : vkPurl.param('siteBackground')
		};

		if (thisConfig.siteUrl) {
			$body.trigger('vkConfig', thisConfig);
		}

	};

	return {
		init: init
	};

});
