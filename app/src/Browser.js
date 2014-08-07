/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var Surface = require('famous/core/Surface');
	var ContainerSurface = require('famous/surfaces/ContainerSurface');
	var StateModifier = require('famous/modifiers/StateModifier');
	var Transform = require('famous/core/Transform');
	var $ = require('jquery');
	var utils = require('utils');

	/* Pub / Sub manager */

	var $body = $('body');

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

	var Browser = function(index, middleIframeIndex) {
		this.index = index;
		this.currentPosition = index;
		this.middleIframeIndex = middleIframeIndex;
		this.transitionState = 'stable';
		this.containerSurface = new ContainerSurface();
		this.modifier = new StateModifier({
			origin: [0.5, 0.5]
		});

		this.containerSurface.addClass('browser');
		this.containerSurface.addClass('browser' + this.index);

		/* Bar */
		var barSurface = new Surface({
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
						'<input type="hidden" name="browserId" value="' + index + '">',
						'<input type="text" name="browserAddress">',
					'</form>',
				'</div>'
			].join('')
		});

		this.containerSurface.add(barSurface);

		/* Iframes */
		this.currentIframeIndex = 0;
		this.iframeSurfaces = [
			new Surface({
				content: [
					'<div class="iframeContainer">',
						'<iframe></iframe>',
					'</div>'
				].join('')
			}),
			new Surface({
				content: [
					'<div class="iframeContainer">',
						'<iframe></iframe>',
					'</div>'
				].join('')
			})
		];

		this.containerSurface.add(iframeModifier).add(this.iframeSurfaces[0]);
		this.containerSurface.add(iframeBottomModifier).add(this.iframeSurfaces[1]);

		var _self = this;

		window.requestAnimationFrame(function(){
			_self.$browser = $('.browser' + _self.index);
			_self.$favicon = _self.$browser.find('.browserTitleBorder img');
			_self.$title = _self.$browser.find('.browserTitleBorder span');
			_self.$iframes = _self.$browser.find('iframe');

			_self.$browser.data('position', _self.index);

			_self.$browser.on('submit', '.browserBar form', function(e) {
				e.preventDefault();
				var browserSettings = utils.serializeFormToJSON(this);
				_self.setFavicon(browserSettings.browserAddress);
				_self.setIframeContent(browserSettings.browserAddress);
			});
			_self.$browser.on('click', function(e) {
				if (e.target.tagName === 'INPUT') return false;
				var originIndex = parseInt($(this).data('position'));
				$body.trigger('browserClick', {index:originIndex})
			});

		})

	};

	Browser.prototype.postMessage = function() {
		
		var message = {
			transitionState : this.transitionState,
			middleIframeIndex : this.middleIframeIndex,
			currentPosition : this.currentPosition
		}

		for (var i in [0,1]) {
			if (this.$iframes[i] && this.$iframes[i].contentWindow) {
				this.$iframes[i].contentWindow.postMessage(message, '*');
			}
		}
	};

	Browser.prototype.showIframe = function() {
		for (var i in [0,1]) {
			if (this.$iframes[i]) {
				this.$iframes[i].style.visibility = 'visible';
			}
		}
	};

	Browser.prototype.setTitle = function(title) {
		console.log(this.$title);
		this.$title.text(title);
	};

	Browser.prototype.setFavicon = function(href) {
		this.$favicon.attr('src', 'http://www.google.com/s2/favicons?domain=' + href);
	};


	Browser.prototype.setIframeContent = function(href) {

		var _self = this;

		window.requestAnimationFrame(function(){
			var _selfSurface = _self.iframeSurfaces[_self.currentIframeIndex];

			_self.$iframes[_self.currentIframeIndex].src = apiUrl(_self.index, href);

			_self.containerSurface.add(iframeModifier).add(_selfSurface);
		})

	};

	Browser.prototype.setPreviewContent = function(href) {

		var _self = this;

		window.requestAnimationFrame(function(){
			var _selfSurface = _self.iframeSurfaces[1 - _self.currentIframeIndex];

			console.log(_self.$iframes[1 - _self.currentIframeIndex]);

			_self.$iframes[1 - _self.currentIframeIndex].src = apiUrl(_self.index, href);

			_self.containerSurface.add(iframeTopModifier).add(_selfSurface);
		})

	};

	Browser.prototype.removePreview = function() {

		this.$iframes[1 - this.currentIframeIndex].src = '';

		this.containerSurface.add(iframeModifier).add(this.iframeSurfaces[this.currentIframeIndex]);
		this.containerSurface.add(iframeBottomModifier).add(this.iframeSurfaces[1 - this.currentIframeIndex]);

	};

	Browser.prototype.setPreviewAsIframeContent = function() {

		this.containerSurface.add(iframeModifier).add(this.iframeSurfaces[1 - this.currentIframeIndex]);
		this.containerSurface.add(iframeBottomModifier).add(this.iframeSurfaces[this.currentIframeIndex]);

		this.currentIframeIndex = 1 - this.currentIframeIndex;
		this.$iframes[1 - this.currentIframeIndex].src = '';

	};

	return Browser;

});
