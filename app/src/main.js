/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var Engine = require('famous/core/Engine');
	var EventHandler = require('famous/core/EventHandler');
	var Settings = require('Settings');
	var Styler = require('Styler');
	var Browsers = require('Browsers');
	var $ = require('jquery');

	/* Pub / Sub manager */

	var $body = $('body');

	/* Minimum vieport width */
  var mvp = Math.max($body.width(), 1440);
  document.getElementById('myViewport').setAttribute('content',
	'maximum-scale=1, user-scalable=no, width=' + mvp);

	/* Main context */

	var mainContext = Engine.createContext();

	var eventHandler = new EventHandler();


	/* Settings */

	var mySettings = new Settings({
		context : mainContext
	});

	eventHandler.subscribe(mySettings.eventHandler);

	/* Address bar */

	eventHandler.on('settings', function(settings) {
		console.log(settings);
		console.log($.param(settings));
		window.history.pushState(settings, '', '?' + $.param(settings));
	});

	/* Styler */

	var myStyler = new Styler();

	eventHandler.on('settings', function(settings) {
		myStyler.set(settings);
	});

	/* Browsers */

	var myBrowsers;

	eventHandler.on('settings', function(settings) {
		// Waiting for a "remove" method in famo.us
		// https://github.com/Famous/famous/pull/153
		$('.browser').remove();
		var browserSettings = $.extend({context : mainContext}, settings);
		myBrowsers = new Browsers(browserSettings);
	});

	/* Bootstrap */

	mySettings.init();

});
