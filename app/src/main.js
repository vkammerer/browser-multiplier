/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var Engine = require('famous/core/Engine');
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

	/* Settings */

	var mySettings = new Settings({
		context : mainContext
	});

	/* Styler */

	var myStyler = new Styler();

	/* Browsers */

	var myBrowsers;

	$body.on('settings', function(e, settings) {

		myStyler.set(settings);

		// Waiting for a "remove" method in famo.us
		// https://github.com/Famous/famous/pull/153
		$('.browser').remove();

		myBrowsers = new Browsers({
			context : mainContext,
			browserPairs : settings.browserPairs,
			browserWidth : settings.browserWidth,
			contentSelector : settings.contentSelector,
			transitionDuration : settings.transitionDuration,
			superpositionRatio : settings.superpositionRatio,
			interfacePadding : settings.interfacePadding,
			sidePadding : settings.sidePadding
		});
	});

});
