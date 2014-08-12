/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var Transform = require('famous/core/Transform');
	var utils = require('utils');
	var $ = require('jquery');
	var Browser = require('Browser');

	/* Pub / Sub manager */

	var $body = $('body');

	/* Window dimensions */

	var Browsers = function(options) {

		var _self = this;

		this.browserBarHeight = 65;

		this.context = options.context;
		this.browserPairs = options.browserPairs;
		this.browserWidth = options.browserWidth;
		this.contentSelector = options.contentSelector;
		this.transitionDuration = options.transitionDuration;
		this.interfacePadding = options.interfacePadding;
		this.sidePadding = options.sidePadding;
		this.superpositionRatio = options.superpositionRatio;

		this.browsers = [];
		this.browsingIndex = 0;
		this.browserTransforms = this.getBrowserTransforms();

		for (var i=0; i<this.getNumberOfBrowsers(); i++) {

			var browser = new Browser({
				browserIndex: i,
				contentSelector : this.contentSelector,
				browserPairs : this.browserPairs
			});

			browser.containerSurface.setSize([this.browserWidth, this.getBrowserHeight()]);
			browser.modifier.setTransform(this.browserTransforms[i]);

			this.browsers.push(browser);
			this.context.add(browser.modifier).add(browser.containerSurface);

		}

		window.addEventListener('message', function(e) {
			_self.receiveMessage(e);
		}, false);

		$body.on('browserClick', function(e, data) {
			_self.browsingIndex = _self.browsingIndex + _self.browserPairs - _self.getBrowserPosition(data.browserIndex);
			_self.transitionAll();
		});

	};

	Browsers.prototype.getBrowserPosition = function(browserIndex) {
		return (this.browsingIndex + browserIndex) % this.browsers.length;
	};

	Browsers.prototype.getBrowserHeight = function() {
		var bodyHeight = $body.height();
		var browserHeight = bodyHeight -  2 * this.interfacePadding;
		return browserHeight;
	};

	Browsers.prototype.getNumberOfBrowsers = function() {
		return this.browserPairs * 2 + 1;
	};

	Browsers.prototype.getBrowserTransforms = function() {

		/* Browser size proportionnally to the main browser  */

		var largestDivider = Math.pow(2, this.browserPairs) - 1;

		var sideSpaceLeft = (window.innerWidth - this.browserWidth - this.sidePadding * 4) / 2;
		var sideSpaceRatio = sideSpaceLeft / this.browserWidth;

		var browserProportions = [];
		for (var h = 0; h < this.browserPairs; h++) {
			browserProportions[h] = sideSpaceRatio / largestDivider * Math.pow(2, this.browserPairs - h - 1) * this.superpositionRatio;
		}

		/*
			@noSuperpositionRatioTranslateX:
				Array of distances on the X axis from the center of the window
				if browsers didnt have a superpositionRatio property;
			@TranslateX:
				Array of distances on the X axis from the center of the window;
		*/
		var noSuperpositionRatioTranslateX = [this.browserWidth * (0.5 + browserProportions[0] / 2 / this.superpositionRatio) + this.sidePadding];
		var translateX = [this.browserWidth * (0.5 + browserProportions[0] / 2) + this.sidePadding];
		for (var i = 1; i < browserProportions.length; i++) {
			var noSuperpositionRatioWidth = this.browserWidth * browserProportions[i] / this.superpositionRatio;
			noSuperpositionRatioTranslateX[i] = noSuperpositionRatioTranslateX[i-1] + noSuperpositionRatioWidth * 3 / 2;
			var thisWidth = this.browserWidth * browserProportions[i];
			var widthDifference = (thisWidth - noSuperpositionRatioWidth) / 2;
			translateX[i] = noSuperpositionRatioTranslateX[i] - widthDifference;
		}

		var translateY = this.getBrowserHeight() / 6;

		var theseBrowserTransforms = [
			Transform.multiply(Transform.translate(0, 0, 0), Transform.scale(1, 1, 1))
		];
		for (var j = 0; j < browserProportions.length; j++) {
			var thisScale =  Transform.scale(browserProportions[j], browserProportions[j], browserProportions[j]);
			var thisTranslateRight = Transform.translate(translateX[j], translateY, -j-1);
			var thisTranslateLeft = Transform.translate(-translateX[j], translateY, -j-1);
			var thisTransformRight = Transform.multiply(thisTranslateRight, thisScale);
			var thisTransformLeft = Transform.multiply(thisTranslateLeft, thisScale);
			theseBrowserTransforms.unshift(thisTransformRight);
			theseBrowserTransforms.push(thisTransformLeft);
		}
		return theseBrowserTransforms;
	};

	Browsers.prototype.transitionAll = function() {

		var _self = this;

		var numberOfBrowsers = this.getNumberOfBrowsers();

		for (var i=0; i<numberOfBrowsers; i++) {

			var modulo = utils.positiveModulo(_self.browsingIndex + i, numberOfBrowsers);
			this.browsers[i].transitionState = 'moving';
			this.browsers[i].currentPosition = modulo;
			this.browsers[i].postMessage();

			this.browsers[i].modifier.setTransform(
				this.browserTransforms[modulo],
				{ duration : this.transitionDuration, curve: 'easeInOut' },
				(function() {
					var thisBrowser = _self.browsers[i];
					return function() {
						thisBrowser.transitionState = 'stable';
						thisBrowser.postMessage();
					};
				})()
			);
		}
	};

	Browsers.prototype.receiveMessage = function(e) {

		if (e.origin !== window.location.origin) {
			return false;
		}

		var originIndex = parseInt(e.data.browserIndex);
		var originPosition = this.getBrowserPosition(originIndex);

		if (e.data.action === 'bodyclick') {
			$body.trigger('browserClick', {browserIndex : originIndex});
		}
		else if (e.data.action === 'ready') {
			var thisBrowser = this.browsers[originIndex];
			thisBrowser.currentPosition = originPosition;
			thisBrowser.postMessage();
			thisBrowser.showIframe();
			thisBrowser.setTitle(e.data.pageTitle);
		}
		else if (originPosition === this.browserPairs) {
			var nextIframeIndex = this.browsers.length - 1 - ((this.browsingIndex + this.browsers.length - this.browserPairs) % this.browsers.length);
			if (e.data.action === 'mouseover') {
				this.browsers[nextIframeIndex].setPreview(e.data.href);
			}
			else if (e.data.action === 'mouseout') {
				this.browsers[nextIframeIndex].removePreview();
			}
			else if (e.data.action === 'click') {
				this.browsingIndex++;
				this.browsers[nextIframeIndex].setPreviewAsContent();
				this.transitionAll();
			}
		}

	};

	return Browsers;

});
