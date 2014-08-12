var fs = require('fs'),
	url = require('url'),
	request = require('request'),
	$ = require('cheerio'),
	validator = require('validator');

var formatIframe = function(settings, req, html) {

	var requestOrigin = 'http://' + req.headers.host;

	var $template = $.load(html);
	var $content = $template(settings.contentSelector).html();

	/* Head */
	$template('head').prepend([
		'<base href="' + settings.siteUrl + '">',
		'<link rel="stylesheet" type="text/css" href="' + requestOrigin + '/iframe/main.css" />'
	].join(''));

	/* Body */
	$template('body').html([
		'<div id="inactiveLayer"></div>',
		'<script>window.sevenBrowsers = {',
			'browserIndex :' + settings.browserIndex + ',',
			'siteUrl :"' + settings.siteUrl + '"',
		'};</script>',
		'<script src="' + requestOrigin + '/iframe/main.js"></script>'
	].join(''));
	$template('body').prepend($content);

	return $template.html();

}

var handleRequest = function (req, res, next) {

	/* Check if this is a call to the API */

	if (!req.url.match(/^\/api/)) {
		return next();
	}

	var parsedUrl = url.parse(req.url, true, true);
	var browserIndex = parsedUrl.query['browserIndex'];
	var siteUrl = parsedUrl.query['siteUrl'];
	var contentSelector = parsedUrl.query['contentSelector'] || 'body';



	/* Check if the "siteUrl" parameter is properly defined */

	if (typeof(browserIndex) === 'undefined') {
		res.statusCode = 400;
		return res.end('please provide a correct "browserIndex" parameter');
	}

	if (!validator.isURL(siteUrl)) {
		res.statusCode = 400;
		return res.end('please provide a correct "siteUrl" parameter');
	}

	request(siteUrl, function(error, response, body){
		if (error) {
			res.statusCode = 400;
			return res.end(error);
		}
		else {
			res.writeHead(200, { 'Cache-Control': 'max-age=3600' });
			return res.end(formatIframe({
				browserIndex : browserIndex,
				siteUrl : siteUrl,
				contentSelector : contentSelector
			}, req, body));
		}
	})
}

module.exports = {
	handleRequest: handleRequest
}
