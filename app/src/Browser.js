/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var ContainerSurface = require('famous/surfaces/ContainerSurface');
	var Surface = require('famous/core/Surface');
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
		this.currentPosition = this.browserIndex;
		this.browserPairs = options.browserPairs;
		this.contentSelector = options.contentSelector;

		this.transitionState = 'stable';

		this.surface = new ContainerSurface();
		this.modifier = new StateModifier({
			origin: [0.5, 0.5]
		});

		this.surface.addClass('browser');
		this.surface.addClass('browser' + this.browserIndex);

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

		this.surface.add(this.barSurface);

		this.loaderModifier = new StateModifier();

		this.loaderSurface = new Surface({
			content: [
				'<div class="loader">',
				'</div>'
			].join('')
		});

		this.loaderModifier.setTransform(inactiveLoaderTransform);

		this.surface.add(this.loaderModifier).add(this.loaderSurface);

		/* Iframes */
		this.currentIframeIndex = 0;

		this.iframes = [
			new Iframe(),
			new Iframe()
		];

		this.iframes[0].modifier.setTransform(iframeTransform);
		this.iframes[1].modifier.setTransform(iframeBottomTransform);

		this.surface.add(this.iframes[0].modifier).add(this.iframes[0].surface);
		this.surface.add(this.iframes[1].modifier).add(this.iframes[1].surface);

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
				_self.isLoading = true;
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

		var isAvailable = false;
		if (
			(this.currentPosition === this.browserPairs) &&
			(this.transitionState === 'stable')
		) {
			isAvailable = true;
		}

		var thisIframeIndex = iframeIndex || this.currentIframeIndex;

		if (this.$iframes[thisIframeIndex].contentWindow) {
			this.$iframes[thisIframeIndex].contentWindow.postMessage(
				{availability : isAvailable},
				'*'
			);
		}

	};

	Browser.prototype.onIframeReady = function(data) {

		this.iframes[data.iframeIndex].title = data.pageTitle;
		this.loaderModifier.setTransform(inactiveLoaderTransform);

		if (data.iframeIndex === this.currentIframeIndex) {
			this.iframes[this.currentIframeIndex].modifier.setTransform(iframeTransform);
			this.iframes[this.currentIframeIndex].modifier.setOpacity(
			    1,
					{ duration : 200, curve: 'linear' },
			    function() { console.log('animation finished!') }
			);
			this.iframes[1 - this.currentIframeIndex].modifier.setTransform(iframeBottomTransform);
			this.setMeta();
		}

		this.postMessage(data.iframeIndex);

	};

	Browser.prototype.setMeta = function() {
		this.$favicon.attr('src', 'http://www.google.com/s2/favicons?domain=' + this.iframes[this.currentIframeIndex].href);
		this.$title.text(this.iframes[this.currentIframeIndex].title);
		this.$adress.val(this.iframes[this.currentIframeIndex].href);
	};

	Browser.prototype.setContent = function() {
		this.loaderModifier.setTransform(activeLoaderTransform);
		this.$iframes[this.currentIframeIndex].src = this.apiUrl(this.currentIframeIndex);
	};

	Browser.prototype.removeContent = function() {
		this.currentIframeIndex = 1 - this.currentIframeIndex;
		this.loaderModifier.setTransform(inactiveLoaderTransform);
		this.iframes[this.currentIframeIndex].modifier.setTransform(iframeTransform);
		this.iframes[1 - this.currentIframeIndex].modifier.setTransform(iframeBottomTransform);
		this.iframes[1 - this.currentIframeIndex].modifier.setOpacity(0);
	};

	return Browser;

});
