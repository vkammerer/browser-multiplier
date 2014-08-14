/*global module*/

var fs = require('fs');
var url = require('url');
var request = require('request');
var $ = require('cheerio');
var validator = require('validator');

var formatIframe = function(settings, req, html) {

	var requestOrigin = 'http://' + req.headers.host;

	var $template = $.load(html);
	var $content = $template(settings.contentSelector).html();

	/* Head */
	$template('head').prepend([
		'<base href="' + settings.pageUrl + '">',
		'<link rel="stylesheet" type="text/css" href="' + requestOrigin + '/iframe/main.css" />'
	].join(''));

	/* Body */
	$template('body').html([
		'<div id="inactiveLayer"></div>',
		'<script>window.sevenBrowsers = {',
			'browserIndex :' + settings.browserIndex + ',',
			'iframeIndex :' + settings.iframeIndex + ',',
			'pageUrl :"' + settings.pageUrl + '"',
		'};</script>',
		'<script src="' + requestOrigin + '/iframe/main.js"></script>'
	].join(''));
	$template('body').prepend($content);

	return $template.html();

};

var handleRequest = function(req, res, next) {

	/* Check if this is a call to the API */

	if (!req.url.match(/^\/api/)) {
		return next();
	}

	var parsedUrl = url.parse(req.url, true, true);
	var browserIndex = parsedUrl.query.browserIndex;
	var iframeIndex = parsedUrl.query.iframeIndex;
	var pageUrl = parsedUrl.query.pageUrl;
	var contentSelector = parsedUrl.query.contentSelector || 'body';

	/* Check if the "pageUrl" parameter is properly defined */

	if (typeof(browserIndex) === 'undefined') {
		res.statusCode = 400;
		return res.end('please provide a correct "browserIndex" parameter');
	}

	if (typeof(iframeIndex) === 'undefined') {
		res.statusCode = 400;
		return res.end('please provide a correct "iframeIndex" parameter');
	}

	if (!validator.isURL(pageUrl)) {
		res.statusCode = 400;
		return res.end('please provide a correct "pageUrl" parameter');
	}

	request(pageUrl, function(error, response, body) {
		if (error) {
			res.statusCode = 400;
			return res.end(error);
		}
		else {
			res.writeHead(200, { 'Cache-Control': 'max-age=3600' });
			return res.end(formatIframe({
				browserIndex : browserIndex,
				iframeIndex : iframeIndex,
				pageUrl : pageUrl,
				contentSelector : contentSelector
			}, req, body));
		}
	});
};

module.exports = {
	handleRequest: handleRequest
};
