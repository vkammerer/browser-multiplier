var fs = require('fs'),
    url = require('url'),
    request = require('request'),
    $ = require('cheerio');

var formatIframe = function(config, req, html) {

    var requestOrigin = 'http://' + req.headers.host;

    var $template = $.load(html);
    var $content = $template(config.siteContentSelector).html();

    /* Head */
    $template('head').prepend('\
        <base href="' + config.siteUrl + '">\
        <link rel="stylesheet" type="text/css" href="' + requestOrigin + '/iframe/main.css" />\
    ');

    /* Body */
    $template('body').html('\
        <div id="contentContainer"></div><div id="inactiveLayer"></div>\
        <script>window.vkSiteUrl = "' + config.siteUrl + '";</script>\
        <script src="' + requestOrigin + '/iframe/main.js"></script>\
    ');
    $template('#contentContainer').html($content);

    return $template.html();

}

var handleRequest = function (req, res, next) {

    if (!req.url.match(/^\/api/)) return next();

    var parsedUrl = url.parse(req.url, true, true);

    var config = {
        siteUrl : parsedUrl.query['siteUrl'] || '',
        siteContentSelector : parsedUrl.query['siteContentSelector'] || 'body'
    }

    if (!config.siteUrl) {
        res.statusCode = 400;
        res.end('please provide a "siteUrl" parameter');
    }

    request(config.siteUrl, function(error, response, body){
        if (error) {
            console.log(error);
            res.statusCode = 400;
            res.end(error);
        }
        else {
            res.writeHead(200, { 'Cache-Control': 'max-age=3600' });
            res.end(formatIframe(config, req, body));

        }
    })
}

module.exports = {
    handleRequest: handleRequest
}
