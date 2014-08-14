/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var Surface = require('famous/core/Surface');
	var ContainerSurface = require('famous/surfaces/ContainerSurface');
	var StateModifier = require('famous/modifiers/StateModifier');
	var Transform = require('famous/core/Transform');
	var $ = require('jquery');
	var utils = require('utils');
	var Iframe = require('Iframe');

	/* Pub / Sub manager */

	var $body = $('body');

	var iframeTransform = Transform.translate(0,65,0);
	var iframeTopTransform = Transform.translate(0,65,2);
	var iframeBottomTransform = Transform.translate(0,65,-1);

	var activeLoaderTransform = Transform.translate(0,65,1);
	var inactiveLoaderTransform = Transform.translate(0,65,-1);

	var Browser = function(options) {

		this.browserIndex = options.browserIndex;
		this.contentSelector = options.contentSelector;

		this.browserPairs = options.browserPairs;
		this.currentPosition = this.browserIndex;

		this.transitionState = 'stable';
		this.containerSurface = new ContainerSurface();
		this.modifier = new StateModifier({
			origin: [0.5, 0.5]
		});

		this.containerSurface.addClass('browser');
		this.containerSurface.addClass('browser' + this.browserIndex);

		/* Bar */
		this.barSurface = new Surface({
			content: [
				'<div class="browserBar">',
					'<div class="browserTitle">',
						'<div class="browserTitleBorder">',
							'<img>',
							'<span></span>',
						'</div>',
					'</div>',
					'<div class="browserTitleWhite"></div>',
					'<form>',
						'<input type="hidden" name="browserId" value="' + this.browserIndex + '">',
						'<input type="text" name="browserAddress">',
					'</form>',
				'</div>'
			].join('')
		});

		this.containerSurface.add(this.barSurface);

		this.loaderModifier = new StateModifier();

		this.loaderSurface = new Surface({
			content: [
				'<div class="loader">',
				'</div>'
			].join('')
		});

		this.loaderModifier.setTransform(inactiveLoaderTransform);

		this.containerSurface.add(this.loaderModifier).add(this.loaderSurface);

		/* Iframes */
		this.currentIframeIndex = 0;

		this.iframes = [
			new Iframe(),
			new Iframe()
		];

		this.iframes[0].modifier.setTransform(iframeTransform);
		this.iframes[1].modifier.setTransform(iframeBottomTransform);

		this.containerSurface.add(this.iframes[0].modifier).add(this.iframes[0].surface);
		this.containerSurface.add(this.iframes[1].modifier).add(this.iframes[1].surface);

		var _self = this;

		window.requestAnimationFrame(function() {
			_self.$browser = $('.browser' + _self.browserIndex);
			_self.$favicon = _self.$browser.find('.browserTitleBorder img');
			_self.$title = _self.$browser.find('.browserTitleBorder span');
			_self.$adress = _self.$browser.find('.browserBar form input');
			_self.$iframes = _self.$browser.find('iframe');

			_self.$browser.data('position', _self.browserIndex);

			_self.$browser.on('submit', '.browserBar form', function(e) {
				e.preventDefault();
				var browserSettings = utils.serializeFormToJSON(this);
				_self.iframes[_self.currentIframeIndex].href = browserSettings.browserAddress;
				_self.setContent();
			});
			_self.$browser.on('click', function(e) {
				if (e.target.tagName === 'INPUT') {
					return false;
				}
				var originIndex = parseInt($(this).data('position'));
				$body.trigger('browserClick', {browserIndex : originIndex});
			});

		});

	};

	Browser.prototype.apiUrl = function(iframeIndex) {
		return '/api/?' + $.param({
			browserIndex : this.browserIndex,
			contentSelector : this.contentSelector,
			pageUrl : this.iframes[iframeIndex].href,
			iframeIndex : iframeIndex
		});
	};

	Browser.prototype.postMessage = function(iframeIndex) {

		var thisIframeIndex = iframeIndex || this.currentIframeIndex;

		var message = {
			browserIndex : this.browserIndex,
			transitionState : this.transitionState,
			browserPairs : this.browserPairs,
			currentPosition : this.currentPosition
		};

		this.$iframes[thisIframeIndex].contentWindow.postMessage(message, '*');
	};

	Browser.prototype.onIframeReady = function(data) {
		this.iframes[data.iframeIndex].title = data.pageTitle;
		this.loaderModifier.setTransform(inactiveLoaderTransform);

		if (data.iframeIndex === this.currentIframeIndex) {
			this.setMeta();
			this.iframes[data.iframeIndex].modifier.setTransform(iframeTransform);
		}
		else {
			this.iframes[data.iframeIndex].modifier.setTransform(iframeTopTransform);
		}

		this.postMessage(data.iframeIndex);

	};

	Browser.prototype.setMeta = function() {
		this.$favicon.attr('src', 'http://www.google.com/s2/favicons?domain=' + this.iframes[this.currentIframeIndex].href);
		this.$title.text(this.iframes[this.currentIframeIndex].title);
		this.$adress.val(this.iframes[this.currentIframeIndex].href);
	};

	Browser.prototype.setContent = function() {

		var _self = this;

		this.loaderModifier.setTransform(activeLoaderTransform);

		window.requestAnimationFrame(function() {
			_self.$iframes[_self.currentIframeIndex].src = _self.apiUrl(_self.currentIframeIndex);
		});

	};

	Browser.prototype.setPreview = function() {

		var _self = this;

		this.loaderModifier.setTransform(activeLoaderTransform);

		window.requestAnimationFrame(function() {
			_self.$iframes[1 - _self.currentIframeIndex].src = _self.apiUrl(1 - _self.currentIframeIndex);
		});

	};

	Browser.prototype.removePreview = function() {

		this.loaderModifier.setTransform(inactiveLoaderTransform);

		this.iframes[this.currentIframeIndex].modifier.setTransform(iframeTransform);
		this.iframes[1 - this.currentIframeIndex].modifier.setTransform(iframeBottomTransform);

		var _self = this;

		window.requestAnimationFrame(function() {
			_self.$iframes[1 - _self.currentIframeIndex].src = '';
		});

	};

	Browser.prototype.setPreviewAsContent = function() {

		this.iframes[1 - this.currentIframeIndex].modifier.setTransform(iframeTransform);
		this.iframes[this.currentIframeIndex].modifier.setTransform(iframeBottomTransform);

		this.currentIframeIndex = 1 - this.currentIframeIndex;

		var _self = this;

		window.requestAnimationFrame(function() {
			_self.$iframes[1 - _self.currentIframeIndex].src = '';
		});

		this.setMeta();

	};

	return Browser;

});
