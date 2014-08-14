/*globals define console*/
define(function(require, exports, module) {
	'use strict';
	var Surface = require('famous/core/Surface');
	var StateModifier = require('famous/modifiers/StateModifier');

	/* Pub / Sub manager */

	var Iframe = function() {

		this.modifier = new StateModifier();

		this.surface = new Surface({
			content : [
				'<div class="iframeContainer">',
					'<iframe></iframe>',
				'</div>'
			].join('')
		});

		this.title = '';
		this.href = '';

	};

	return Iframe;

});
