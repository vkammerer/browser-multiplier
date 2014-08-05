/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var Surface = require('famous/core/Surface');
	var ContainerSurface = require('famous/surfaces/ContainerSurface');
	var StateModifier = require('famous/modifiers/StateModifier');
	var Transform = require('famous/core/Transform');
	var $ = require('jquery');

	var iframeModifier = new StateModifier({
		transform: Transform.translate(0,65,0)
	});
	var iframeTopModifier = new StateModifier({
		transform: Transform.translate(0,65,1)
	});
	var iframeBottomModifier = new StateModifier({
		transform: Transform.translate(0,65,-1)
	});

	var apiUrl = function(index, href) {
		return '/api/?' + $.param({
			siteIndex : index,
			siteUrl : href
		});
	};

	var Browser = function(index) {
		this.index = index;
		this.transitionState = 'stable';
		this.surface = new ContainerSurface();
		this.modifier = new StateModifier({
			origin: [0.5, 0.5]
		});

		this.surface.addClass('browser');
		this.surface.addClass('browser' + this.index);

		/* Bar */
		var barSurface = new Surface({
			content: [
				'<div class="browserBar">',
					'<div class="browserTitle"><div class="browserTitleBorder"></div></div>',
					'<div class="browserTitleWhite"></div>',
					'<form>',
						'<input type="hidden" name="browserId" value="' + index + '">',
						'<input type="text" name="browserAddress">',
					'</form>',
				'</div>'
			].join('')
		});

		this.surface.add(barSurface);

		/* Iframes */
		this.iframeData = {};
		this.currentIframeIndex = 0;
		this.iframeSurfaces = [
			new Surface(),
			new Surface()
		];

	};

	Browser.prototype.postMessage = function(message) {
		var iframes = $('.browser' + this.index + ' iframe');
		message.transitionState = this.transitionState;
		console.log(this.transitionState);
		for (var i in [0,1]) {
			if (iframes[i] && iframes[i].contentWindow) {
				iframes[i].contentWindow.postMessage(message, '*');
			}
		}
	};

	Browser.prototype.showIframe = function() {
		var iframes = $('.browser' + this.index + ' iframe');
		for (var i in [0,1]) {
			if (iframes[i]) {
				iframes[i].style.visibility = 'visible';
			}
		}
	};

	Browser.prototype.setTitle = function(title) {
		var titles = $('.browser' + this.index + ' .browserTitleBorder');
		titles.text(title);
	};

	Browser.prototype.setIframeContent = function(href) {

		var thisSurface = this.iframeSurfaces[this.currentIframeIndex];

		thisSurface.setContent([
			'<div class="iframeContainer">',
				'<iframe src="' + apiUrl(this.index, href) + '"></iframe>',
			'</div>'
		].join(''));

		this.surface.add(iframeModifier).add(thisSurface);

	};

	Browser.prototype.setPreviewContent = function(href) {

		var thisSurface = this.iframeSurfaces[1 - this.currentIframeIndex];

		thisSurface.setContent([
			'<div class="iframeContainer">',
				'<iframe src="' + apiUrl(this.index, href) + '"></iframe>',
			'</div>'
		].join(''));

		this.surface.add(iframeTopModifier).add(thisSurface);

	};

	Browser.prototype.removePreview = function() {

		this.iframeSurfaces[1 - this.currentIframeIndex].setContent('');

		this.surface.add(iframeModifier).add(this.iframeSurfaces[this.currentIframeIndex]);
		this.surface.add(iframeBottomModifier).add(this.iframeSurfaces[1 - this.currentIframeIndex]);

	};

	Browser.prototype.setPreviewAsIframeContent = function() {

		this.surface.add(iframeModifier).add(this.iframeSurfaces[1 - this.currentIframeIndex]);
		this.surface.add(iframeBottomModifier).add(this.iframeSurfaces[this.currentIframeIndex]);

		this.currentIframeIndex = 1 - this.currentIframeIndex;
		this.iframeSurfaces[1 - this.currentIframeIndex].setContent('');

	};

	return Browser;

});
