/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var Transform = require('famous/core/Transform');
	var utils = require('utils');
	var $ = require('jquery');

	var Browser = require('Browser');

	/* Pub / Sub manager */

	var $body = $('body');

	/* Custom dimensions */

	var interfacePadding = 40;
	var browserBarHeight = 65;
	var tabWidth = 980;
	var translateXRatio = 0.6;
	var transitionDuration = 500;
	var browserProportions = [
		0.2,
		0.2,
		0.2
	];

	/* Window dimensions */

	var bodyHeight = $body.height();

	var browserHeight = bodyHeight -  2 * interfacePadding;
	var iframeHeight = browserHeight - browserBarHeight;
	var translateY = browserHeight / 6;

	/* Transformations  */

	// middle Browser remains unchanged
	var browserTransforms = [
		Transform.multiply(Transform.translate(0, 0, 0), Transform.scale(1, 1, 1))
	];

	// @TranslateX : distances on the X axis from the center of the window;
	var translateX = [tabWidth * (0.5 + browserProportions[0] / 2) + 10];
	for (var i = 1; i < browserProportions.length; i++) {
		translateX[i] = translateX[i-1] + tabWidth * browserProportions[i-1] * translateXRatio;
	}

	for (var j = 0; j < browserProportions.length; j++) {
		var thisScale =  Transform.scale(browserProportions[j], browserProportions[j], browserProportions[j]);
		var thisTranslateRight = Transform.translate(translateX[j], translateY, -j-1);
		var thisTranslateLeft = Transform.translate(-translateX[j], translateY, -j-1);
		var thisTransformRight = Transform.multiply(thisTranslateRight, thisScale);
		var thisTransformLeft = Transform.multiply(thisTranslateLeft, thisScale);
		browserTransforms.unshift(thisTransformRight);
		browserTransforms.push(thisTransformLeft);
	}

	var settings;
	var browsers = [];
	var iframeBrowsingIndex = 0;
	var middleIframeIndex = Math.floor(browserTransforms.length / 2);

	var initSurfaces = function(context) {
		for (var i=0; i<browserTransforms.length; i++) {

			var browser = new Browser(i);
			browsers.push(browser);
			context.add(browser.modifier).add(browser.surface);

		}
	};

	var resetSurfaces = function() {
		for (var i=0; i<browsers.length; i++) {
			browsers[i].surface.setSize([settings.siteWidth, browserHeight]);
			browsers[i].modifier.setTransform(browserTransforms[i]);
		}
	};

	var transitionAll = function(index) {

		for (var i=0; i<browserTransforms.length; i++) {
			var modulo = utils.positiveModulo(index + i, browserTransforms.length);
			browsers[i].transitionState = 'moving';
			browsers[i].postMessage({
				currentPosition: modulo
			});

			browsers[i].modifier.setTransform(
				browserTransforms[modulo],
				{ duration : transitionDuration, curve: 'easeInOut' },
				(function() {
					var thisBrowser = browsers[i];
					return function() {
						thisBrowser.transitionState = 'stable';
						thisBrowser.postMessage({});
					};
				})()
			);
		}
	};

	var receiveMessage = function(e) {

		if (e.origin !== window.location.origin) {
			return false;
		}

		var originIndex = parseInt(e.data.siteIndex);
		var originPosition = (iframeBrowsingIndex + originIndex) % browsers.length;
		var nextIframeIndex = browsers.length - 1 - ((iframeBrowsingIndex + browsers.length - middleIframeIndex) % browsers.length);

		if (e.data.action === 'ready') {
			browsers[originIndex].postMessage({
				currentPosition: originPosition,
				middleIframeIndex : middleIframeIndex
			});
			browsers[originIndex].showIframe();
			browsers[originIndex].setTitle(e.data.pageTitle);
		}
		else if (originPosition === middleIframeIndex) {
			if (e.data.action === 'mouseover') {
				browsers[nextIframeIndex].setPreviewContent(e.data.href);
			}
			else if (e.data.action === 'mouseout') {
				browsers[nextIframeIndex].removePreview();
			}
			else if (e.data.action === 'click') {
				iframeBrowsingIndex++;
				browsers[nextIframeIndex].setPreviewAsIframeContent();
				transitionAll(iframeBrowsingIndex);
			}
		}
		else if (e.data.action === 'bodyclick') {
			iframeBrowsingIndex = iframeBrowsingIndex + middleIframeIndex - originPosition;
			transitionAll(iframeBrowsingIndex);
		}
	};

	var setStyles = function() {
		$('#styler').html([
			'body {background:' + settings.siteBackground + ';} ',
			'.iframeContainer, iframe {height:' + iframeHeight + 'px;} '
		].join(''));
	};

	var initEvents = function() {
		window.addEventListener('message', receiveMessage, false);

		$body.on('submit', '.browserBar form', function(e) {
			e.preventDefault();
			var browserSettings = utils.serializeFormToJSON(this);
			browsers[browserSettings.browserId].setIframeContent(browserSettings.browserAddress);
		});
	};

	var reset = function(theseSettings, context) {

		settings = theseSettings;

		if (browsers.length === 0) {
			initSurfaces(context);
			initEvents();
		}

		resetSurfaces();
		setStyles();
		browsers[middleIframeIndex].setIframeContent('');

	};

	return {
		reset: reset
	};

});
