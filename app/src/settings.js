/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	// import dependencies
	var Surface = require('famous/core/Surface');
	var Modifier = require('famous/core/Modifier');
	var Transform = require('famous/core/Transform');
	var $ = require('jquery');
	var purl = require('purl');

	/* Pub / Sub manager */

	var $body = $('body');

	var Settings = function(options) {

		this.context = options.context;

		var defaults = {
			browserPairs: 1,
			browserWidth          : 980,
			contentSelector       : 'body',
			transitionDuration    : 500,
			interfacePadding      : 20,
			sidePadding           : 20,
			superpositionRatio    : 1,
			siteBackground        : 'url(data:image/png;base64,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) 50% 50% repeat rgb(245, 245, 245)'
		};

		var thisPurl = purl(window.location.href);

		this.browserPairs = parseFloat(thisPurl.param('browserPairs')) || defaults.browserPairs;
		this.browserWidth = parseFloat(thisPurl.param('browserWidth')) || defaults.browserWidth;
		this.contentSelector = thisPurl.param('contentSelector') || defaults.contentSelector;
		this.transitionDuration = parseFloat(thisPurl.param('transitionDuration')) || defaults.transitionDuration;
		this.interfacePadding = parseFloat(thisPurl.param('interfacePadding')) || defaults.interfacePadding;
		this.sidePadding = parseFloat(thisPurl.param('sidePadding')) || defaults.sidePadding;
		this.superpositionRatio = parseFloat(thisPurl.param('superpositionRatio')) || defaults.superpositionRatio;
		this.siteBackground = thisPurl.param('siteBackground') || defaults.siteBackground;

		console.log(this);

		this.modifier = new Modifier({
			transform : Transform.translate(-10, 10, 1),
			opacity   : 1,
			origin    : [1, 0],
			size      : [400, 270]
		});
		this.surface = this.createSurface();

		this.context.add(this.modifier).add(this.surface);

		var _self = this;

		window.requestAnimationFrame(function() {
			_self.initEvents();
			$body.trigger('settings', _self);
		});

	};

	/* Formulaire */

	Settings.prototype.createSurface = function() {
		return new Surface({
			content: [
			'<form id="formulaire">',
				'<h1>Settings</h1>',
				'<div class="inputContainer">',
					'<label for="browserPairs">Pairs of browsers</label>',
					'<input type="number" name="browserPairs" value="' + this.browserPairs + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="browserWidth">Browser Width</label>',
					'<input type="number" name="browserWidth" value="' + this.browserWidth + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="contentSelector">Content Selector</label>',
					'<input type="text" name="contentSelector" value="' + this.contentSelector + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="transitionDuration">transitionDuration</label>',
					'<input type="number" name="transitionDuration" value="' + this.transitionDuration + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="superpositionRatio">superpositionRatio</label>',
					'<input type="number" name="superpositionRatio" value="' + this.superpositionRatio + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="interfacePadding">interfacePadding</label>',
					'<input type="number" name="interfacePadding" value="' + this.interfacePadding + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="sidePadding">sidePadding</label>',
					'<input type="number" name="sidePadding" value="' + this.sidePadding + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="siteBackground">Background</label>',
					'<input type="text" name="siteBackground" value="' + this.siteBackground + '">',
				'</div>',
				'<div class="inputContainer">',
					'<input type="submit" value="Pimp it">',
				'</div>',
				'<div class="inputContainer">',
				'</div>',
			'</form>'
			].join('')
		});

	};

	Settings.prototype.initEvents = function() {

		$body.on('submit', '#formulaire', function(e) {
			e.preventDefault();
			var settingsA = $(this).serializeArray();
			var settings = {};

			$.each(settingsA, function() {
					var thisValue = isNaN(this.value) ? this.value : parseFloat(this.value);
					settings[this.name] = thisValue || '';
			});

			delete settings.siteBackground;

			$body.trigger('settings', settings);

			console.log(settings);

			var settingsParams = '?' + $.param(settings);
			console.log(settingsParams);

			window.history.pushState(settings, 'Browser multiplier', settingsParams);

		});
	};

	return Settings;

});
