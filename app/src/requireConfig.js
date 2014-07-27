/*globals require*/
require.config({
    shim: {
    },
    paths: {
        famous: '../lib/famous',
        requirejs: '../lib/requirejs/require',
        almond: '../lib/almond/almond',
        jquery: '../lib/jquery/dist/jquery',
        purl: '../lib/purl/purl'
    },
    packages: [

    ]
});
require(['main']);
