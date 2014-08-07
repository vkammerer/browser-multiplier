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
	var translateXRatio = 1;
	var transitionDuration = 500;
	var browserProportions = [];

	var numberOfPairOfBrowsers = 3;

	var browserProportions2 = [];
	var sidePadding = 50;

	var leftSpaceLeft = window.innerWidth - tabWidth - sidePadding * 6;

	var totalSideSpaceRatio = leftSpaceLeft / 2 / tabWidth;
	var suiteSum = Math.pow(2, numberOfPairOfBrowsers) - 1;

	for (var i = 0; i < numberOfPairOfBrowsers; i++) {

		var thisRatio = totalSideSpaceRatio / suiteSum * Math.pow(2, numberOfPairOfBrowsers - i - 1);
		browserProportions.push(thisRatio);

	}

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
	var translateX = [tabWidth * (0.5 + browserProportions[0] / 2) + sidePadding];
	for (var i = 1; i < browserProportions.length; i++) {
		translateX[i] = translateX[i-1] + (tabWidth + sidePadding * 2) * browserProportions[i] * 3 / 2;
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

			var browser = new Browser(i, middleIframeIndex);
			browsers.push(browser);
			context.add(browser.modifier).add(browser.containerSurface);

		}
	};

	var resetSurfaces = function() {
		for (var i=0; i<browsers.length; i++) {
			browsers[i].containerSurface.setSize([settings.siteWidth, browserHeight]);
			browsers[i].modifier.setTransform(browserTransforms[i]);
		}
	};

	var transitionAll = function(index) {

		for (var i=0; i<browserTransforms.length; i++) {
			var modulo = utils.positiveModulo(index + i, browserTransforms.length);
			browsers[i].transitionState = 'moving';
			browsers[i].currentPosition = modulo;
			browsers[i].postMessage();

			browsers[i].modifier.setTransform(
				browserTransforms[modulo],
				{ duration : transitionDuration, curve: 'easeInOut' },
				(function() {
					var thisBrowser = browsers[i];
					return function() {
						thisBrowser.transitionState = 'stable';
						thisBrowser.postMessage();
					};
				})()
			);
		}
	};

	$body.on('browserClick', function(e, data){
		var originPosition = (iframeBrowsingIndex + data.index) % browsers.length;
		iframeBrowsingIndex = iframeBrowsingIndex + middleIframeIndex - originPosition;
		transitionAll(iframeBrowsingIndex);
	});

	var receiveMessage = function(e) {

		if (e.origin !== window.location.origin) {
			return false;
		}

		var originIndex = parseInt(e.data.siteIndex);
		var originPosition = (iframeBrowsingIndex + originIndex) % browsers.length;

		if (e.data.action === 'bodyclick') {
			$body.trigger('browserClick', {index : originIndex});
		}
		else if (e.data.action === 'ready') {
			var thisBrowser = browsers[originIndex];
			thisBrowser.currentPosition = originPosition;
			thisBrowser.postMessage();
			thisBrowser.showIframe();
			thisBrowser.setTitle(e.data.pageTitle);
		}
		else if (originPosition === middleIframeIndex) {
			var nextIframeIndex = browsers.length - 1 - ((iframeBrowsingIndex + browsers.length - middleIframeIndex) % browsers.length);
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

	};

	var setStyles = function() {
		$('#styler').html([
			'body {background:' + settings.siteBackground + ';} ',
			'.iframeContainer, iframe {height:' + iframeHeight + 'px;} '
		].join(''));
	};

	var initEvents = function() {
		window.addEventListener('message', receiveMessage, false);
	};

	var reset = function(theseSettings, context) {

		settings = theseSettings;

		if (browsers.length === 0) {
			initSurfaces(context);
			initEvents();
		}

		resetSurfaces();
		setStyles();

	};

	return {
		reset: reset
	};

});
