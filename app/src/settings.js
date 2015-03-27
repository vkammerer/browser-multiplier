/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var EventHandler = require('famous/core/EventHandler');
	var ContainerSurface = require('famous/surfaces/ContainerSurface');
	var Surface = require('famous/core/Surface');
	var StateModifier = require('famous/modifiers/StateModifier');
	var Transform = require('famous/core/Transform');
	var $ = require('jquery');
	var purl = require('purl');

	/* Pub / Sub manager */

	var $body = $('body');

	var onScaleTransform = Transform.scale(1, 1, 1);
	var onRotateTransform = Transform.rotate(0, 0, 0);
	var onTranslateTransform = Transform.translate(0, 0, 1);
	var onTransform = Transform.multiply(onTranslateTransform, Transform.multiply(onScaleTransform, onRotateTransform));

	var offScaleTransform = Transform.scale(0.2, 0.2, 0.2);
	var offRotateTransform = Transform.rotate(0, Math.PI, 0);
	var offTranslateTransform = Transform.translate(-90, 10, 1);
	var offTransform = Transform.multiply(offTranslateTransform, Transform.multiply(offScaleTransform, offRotateTransform));

	var defaults = {
		browserPairs: 1,
		transitionDuration    : 500,
		browserWidth          : 980,
		interfacePadding      : 20,
		sidePadding           : 20,
		superpositionRatio    : 1,
		contentSelector       : 'body',
		siteBackground        : ''
	};

	var thisPurl = purl(window.location.href);

	var Settings = function(options) {

		var _self = this;

		this.context = options.context;
		this.eventHandler = new EventHandler();
		this.open = true;

		this.settings = {
			browserPairs : parseFloat(thisPurl.param('browserPairs')) || defaults.browserPairs,
			transitionDuration : parseFloat(thisPurl.param('transitionDuration')) || defaults.transitionDuration,
			browserWidth : parseFloat(thisPurl.param('browserWidth')) || defaults.browserWidth,
			interfacePadding : parseFloat(thisPurl.param('interfacePadding')) || defaults.interfacePadding,
			sidePadding : parseFloat(thisPurl.param('sidePadding')) || defaults.sidePadding,
			superpositionRatio : parseFloat(thisPurl.param('superpositionRatio')) || defaults.superpositionRatio,
			contentSelector : thisPurl.param('contentSelector') || defaults.contentSelector,
			siteBackground : thisPurl.param('siteBackground') || defaults.siteBackground
		}

		/* Container */

		this.modifier = new StateModifier({
			size      : [400, 400],
			origin    : [0.5, 0.5],
			transform : onTranslateTransform,
			opacity   : 1
		});

		this.surface = new ContainerSurface({
    	classes: ['backfaceVisibility']
		});

		/* Logo */

		this.logoModifier = new StateModifier({
			size: [400, 400],
			origin    : [0.5, 0.5],
			transform : Transform.multiply(Transform.rotate(0, Math.PI, 0),Transform.translate(0, 0, 1))
		});

		this.logoSurface = new Surface({
    	classes: ['backfaceVisibility'],
			content : [
				'<div class="logo">',
					'<span>BM</span>',
				'</div>'
			].join('')
		});

		this.surface.add(this.logoModifier).add(this.logoSurface);

		this.logoSurface.on('click', function(){
			_self.toggle();
		});

		/* Form */

		this.formModifier = new StateModifier({
			origin    : [0.5, 0.5],
			transform : Transform.translate(0, 0, 0)
		});

		this.formSurface = this.createFormSurface();

		this.surface.add(this.formModifier).add(this.formSurface);

		this.formSurface.on('click', function(){
//			_self.toggle();
		});

	};

	Settings.prototype.toggle = function(e) {

		var thisTransform;
		var thisOrigin;
		if (this.open) {
			thisTransform = offTransform;
			thisOrigin = [1, 0];
		}
		else {
			thisTransform = onTransform;
			thisOrigin = [0.5, 0.5];
		}

		this.modifier
			.setTransform(
				thisTransform,
				{ duration : 500, curve: 'easeOut' }
			)
			.setOrigin(
				thisOrigin,
				{ duration : 500, curve: 'easeOut' }
			);

		this.open = !this.open;

	}

	/* Form Surface */

	Settings.prototype.createFormSurface = function() {
		return new Surface({
    	classes: ['backfaceVisibility'],
			content: [
			'<form id="settingsform">',
				'<div class="close">X</div>',
				'<div class="inputContainer">',
					'<label for="browserPairs">Pairs of browsers</label>',
					'<input type="number" name="browserPairs" value="' + this.settings.browserPairs + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="transitionDuration">transitionDuration</label>',
					'<input type="number" name="transitionDuration" value="' + this.settings.transitionDuration + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="browserWidth">Browser Width</label>',
					'<input type="number" name="browserWidth" value="' + this.settings.browserWidth + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="superpositionRatio">superpositionRatio</label>',
					'<input type="number" name="superpositionRatio" value="' + this.settings.superpositionRatio + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="interfacePadding">interfacePadding</label>',
					'<input type="number" name="interfacePadding" value="' + this.settings.interfacePadding + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="sidePadding">sidePadding</label>',
					'<input type="number" name="sidePadding" value="' + this.settings.sidePadding + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="contentSelector">Content Selector</label>',
					'<input type="text" name="contentSelector" value="' + this.settings.contentSelector + '">',
				'</div>',
				'<div class="inputContainer">',
					'<label for="siteBackground">Background</label>',
					'<input type="text" name="siteBackground" value="' + this.settings.siteBackground + '">',
				'</div>',
				'<div style="clear:both"></div>',
			'</form>'
			].join('')
		});
	};

	Settings.prototype.initEvents = function() {

		var _self = this;

		window.requestAnimationFrame(function() {
			$body.on('change', '#settingsform input', function(e) {
				e.preventDefault();
				console.log(this);
				var thisValue = isNaN(this.value) ? this.value : parseFloat(this.value);
				_self.settings[this.name] = thisValue || '';
				console.log('yay');
				_self.eventHandler.emit('settings', _self.settings);
			});
		});
	};

	Settings.prototype.init = function() {
		this.context.add(this.modifier).add(this.surface);
		this.initEvents();
		this.eventHandler.emit('settings', this.settings);

		var _self = this;

		window.requestAnimationFrame(function () {
			_self.$close = $('#settingsform .close');
			_self.$close.on('click', function(){
				_self.toggle();
			});
		})
	}

	return Settings;

});
