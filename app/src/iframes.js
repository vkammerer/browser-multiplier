/*globals define console*/
define(function(require, exports, module) {
    'use strict';
    var Surface = require('famous/core/Surface');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var utils = require('utils');
    var $ = require('jquery');

    /* Pub / Sub manager */

    var $body = $('body');

    /* Iframes */

    var iframeSurfaces = [];
    var iframeModifiers = [];
    var iframeTransforms = [
        Transform.multiply(Transform.multiply(Transform.scale(0.08, 0.08, 0.08), Transform.translate(11400, 0, -2)), Transform.translate(0, 2700, 0)),
        Transform.multiply(Transform.multiply(Transform.scale(0.15, 0.15, 0.15), Transform.translate(5500, 0, -1)), Transform.translate(0, 1400, 0)),
        Transform.multiply(Transform.multiply(Transform.scale(0.33, 0.33, 0.33), Transform.translate(2000, 0, 0)), Transform.translate(0, 600, 0)),
        Transform.multiply(Transform.multiply(Transform.scale(1, 1, 1), Transform.translate(0, 0, 1)), Transform.translate(0, 30, 0)),
        Transform.multiply(Transform.multiply(Transform.scale(0.33, 0.33, 0.33), Transform.translate(-2000, 0, 0)), Transform.translate(0, 600, 0)),
        Transform.multiply(Transform.multiply(Transform.scale(0.15, 0.15, 0.15), Transform.translate(-5500, 0, -1)), Transform.translate(0, 1400, 0)),
        Transform.multiply(Transform.multiply(Transform.scale(0.08, 0.08, 0.08), Transform.translate(-11400, 0, -2)), Transform.translate(0, 2700, 0))
    ];
    var iframeBrowsingIndex = 0;
    var middleIframeIndex = Math.floor(iframeTransforms.length / 2);

    var createSurfaces = function(config) {
        for (var i=0; i<iframeTransforms.length; i++) {
            var iframe = new Surface({
                size: [config.siteWidth, 830]
            });

            iframeSurfaces.push(iframe);

            var iframeModifier = new StateModifier({
                origin: [0.5, 0.5],
                transform: iframeTransforms[i]
            });

            iframeModifiers.push(iframeModifier);

        }
    };

    var resetSurfaces = function() {
        for (var i=0; i<iframeSurfaces.length; i++) {
            iframeSurfaces[i].setContent('');
            iframeModifiers[i].setTransform(iframeTransforms[i]);
        }
    };

    var setIframeContent = function(config, index, href) {
        var thisConfig = {
            siteUrl : href,
            siteContentSelector : config.siteContentSelector
        };

        var src = '/api/?' + $.param(thisConfig);
        iframeSurfaces[index].setContent([
            '<div class="browser">',
                '<form class="browserBar">',
                    '<input type="hidden" name="browserId" value="' + index + '">',
                    '<input type="text" name="browserAddress">',
                    '<input type="submit" value="Go">',
                '</form>',
                '<div class="iframeContainer">',
                    '<iframe id="iframe' +  index + '" src="' + src + '"></iframe>',
                '</div>',
            '</div>'
        ].join(''));
    };

    var positiveModulo = function(n, m) {
        return ((n%m)+m)%m;
    };

    var transitionAll = function(index) {

        for (var i=0; i<iframeTransforms.length; i++) {
            var modulo = positiveModulo(index + i, iframeTransforms.length);
            var thisIframe = $('#iframe' + i)[0];
            if (thisIframe) {
                thisIframe.contentWindow.postMessage({
                    position: modulo
                }, '*');
            }

            iframeModifiers[i].setTransform(
                iframeTransforms[modulo],
                { duration : 500, curve: 'easeInOut' }
            );
        }
    };

    var receiveMessage = function(config, e) {

        if (e.origin !== window.location.origin) {
            return false;
        }

        var originIndex = parseInt(e.source.frameElement.id.substring(6,8));
        var originPosition = (iframeBrowsingIndex + originIndex) % iframeSurfaces.length;
        var nextIframeIndex = iframeSurfaces.length - 1 - ((iframeBrowsingIndex + iframeSurfaces.length - middleIframeIndex) % iframeSurfaces.length);

        if (e.data.action === 'ready') {
            e.source.postMessage({position: originPosition}, '*');
            $('#iframe' + originIndex).css('visibility', 'visible');
        }
        else if (originPosition === middleIframeIndex) {
            if (e.data.action === 'hover') {
                setIframeContent(config, nextIframeIndex, e.data.href);
            }
            else if (e.data.action === 'click') {
                iframeBrowsingIndex++;
                transitionAll(iframeBrowsingIndex);
            }
        }
        else if (e.data.action === 'bodyclick') {
            iframeBrowsingIndex = iframeBrowsingIndex + middleIframeIndex - originPosition;
            transitionAll(iframeBrowsingIndex);
        }
    };

    var setStyles = function(config) {
        $('#vkStyle').html('<style id="vkStyle">body {background:' + config.siteBackground + ';} iframe {width:' + config.siteWidth + 'px;}</style>');
    };

    var reset = function(config, context) {

        if (iframeSurfaces.length === 0) {
            createSurfaces(config);

            window.addEventListener('message', function(e) {
                receiveMessage(config, e);
            }, false);

            $body.on('submit', 'form.browserBar', function(e) {
                e.preventDefault();
                var thisConfig = utils.serializeFormToJSON(this);
                console.log(thisConfig);
                setIframeContent(config, thisConfig.browserId, thisConfig.browserBar);
            });

            for (var i = 0; i < iframeSurfaces.length; i++) {
                context.add(iframeModifiers[i]).add(iframeSurfaces[i]);
            }
        }

        else {
            resetSurfaces();
        }

        setStyles(config);
        setIframeContent(config, middleIframeIndex, 'http://cloneproduction.net');

    };

    return {
        reset: reset
    };

});
