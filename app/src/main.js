/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var Engine = require('famous/core/Engine');
	var browsers = require('browsers');
	var router = require('router');
	var settings = require('settings');
	var $ = require('jquery');

	/* Main context */

	var mainContext = Engine.createContext();

	/* Pub / Sub manager */

	var $body = $('body');

	/* Ifames */

	$body.on('settings', function(e, config) {
		browsers.reset(config, mainContext);
	});

	/* Url router */

	router.init();

	/* Settings */

	settings.init(mainContext);

});
