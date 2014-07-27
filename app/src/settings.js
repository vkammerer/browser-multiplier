/*globals define console*/
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var utils = require('utils');
    var $ = require('jquery');

    /* Pub / Sub manager */

    var $body = $('body');

    /* Formulaire */

    var defaults = {
        siteWidth: '980',
        siteContentSelector: 'body',
        siteBackground: 'white'
    };

    /* Formulaire */

    var formulaireSurface = new Surface({
        content: [
        '<form id="formulaire">',
            '<h1>The 7 windows browser</h1>',
            '<div class="inputContainer">',
                '<label for="siteWidth">Tab Width</label>',
                '<input type="number" name="siteWidth" value="' + defaults.siteWidth + '">',
            '</div>',
            '<div class="inputContainer">',
                '<label for="siteContentSelector">Content Selector</label>',
                '<input type="text" name="siteContentSelector" value="' + defaults.siteContentSelector + '">',
            '</div>',
            '<div class="inputContainer">',
                '<label for="siteBackground">Background</label>',
                '<input type="text" name="siteBackground" value="' + defaults.siteBackground + '">',
            '</div>',
            '<div class="inputContainer">',
                '<input type="submit" value="Pimp it">',
            '</div>',
            '<div class="inputContainer">',
            '</div>',
        '</form>'
        ].join('')
    });

    var formulaireModifier = new Modifier({
        transform : Transform.translate(-10, 10, 0),
        opacity   : 1,
        origin    : [1, 0],
        size      : [400, 400]
    });

    $body.on('submit', '#formulaire', function(e) {
        e.preventDefault();
        var thisConfig = utils.serializeFormToJSON(this);
        console.log(thisConfig);
        if (
            thisConfig.siteContentSelector &&
            thisConfig.siteWidth &&
            thisConfig.siteBackground
        ) {
            console.log(thisConfig);
            $body.trigger('vkSettings', thisConfig);
        }

    });

    var init = function(context) {
        context.add(formulaireModifier).add(formulaireSurface);
        $body.trigger('vkSettings', defaults);
    };

    return {
        init: init
    };

});
