/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var Engine = require('famous/core/Engine');
//    var logos = require('logos');
	var iframes = require('iframes');
	var router = require('router');
	var settings = require('settings');
	var $ = require('jquery');

	/* Main context */

	var mainContext = Engine.createContext();

	/* Pub / Sub manager */

	var $body = $('body');

	/* Logo */

//    logos.init(mainContext);

	/* Ifames */

	$body.on('vkSettings', function(e, config) {
		iframes.reset(config, mainContext);
	});

	/* Url router */

	router.init();

	/* Settings */

	settings.init(mainContext);

});
