/*globals define console*/
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');

    /* LOGO */

    var regularSurface = new ImageSurface({
        content: '/content/images/clone_logo.png'
    });
    var inversedSurface = new ImageSurface({
        content: '/content/images/clone_logo_inversed.png'
    });

    var regularModifier = new Modifier({
        transform : Transform.translate(-500, -200, 2),
        opacity   : 1,
        origin    : [0.5, 0],
        size      : [142, 142]
    });
    var inversedModifier = new Modifier({
        transform: Transform.translate(500, -200, 2),
        opacity   : 1,
        origin    : [0.5, 0],
        size      : [142, 142]
    });

/*

        logoModifier.setTransform(
            Transform.multiply(Transform.translate(-500, 20, 2), Transform.rotateZ(Math.PI * 1.01)),
            { duration : 200, curve: 'linear' },
            function() {
                logoModifier.setTransform(
                    Transform.multiply(Transform.translate(-500, 20, 2), Transform.rotateZ(Math.PI * 2)),
                    { duration : 200, curve: 'linear' },
                    function() {
                    }
                );
            }
        );

*/

/*
    logoModifier.setOpacity(1, {duration : 500});
    logoModifier.setSize([100,100], {duration : 500});
    logoModifier.setOrigin([0,0], {duration : 500});
*/

    var logoAnimation = function() {
        regularModifier.setTransform(
            Transform.translate(-500, 20, 2),
            { duration : 500, curve: 'easeInOut' },
            function() {
                regularModifier.setTransform(
                    Transform.translate(500, 20, 2),
                    { duration : 500, curve: 'easeInOut' },
                    function() {
                        regularModifier.setTransform(Transform.translate(-500, -200, 2));
                        inversedModifier.setTransform(
                            Transform.translate(500, 20, 2),
                            { duration : 0 },
                            function() {
                                inversedModifier.setTransform(
                                    Transform.translate(-500, 20, 2),
                                    { duration : 500, curve: 'easeInOut' },
                                    function() {
                                        regularModifier.setTransform(Transform.translate(-500, 20, 2));
                                        inversedModifier.setTransform(Transform.translate(500, -200, 2));
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    };

    var init = function(context) {
        context.add(regularModifier).add(regularSurface);
        context.add(inversedModifier).add(inversedSurface);
    };

    return {
        init: init,
        animation: logoAnimation
    };

});
