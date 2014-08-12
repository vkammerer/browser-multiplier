var connect = require('connect');
var serverApi = require('./api');

var apiMiddleware = function(req, res, next) {
  if (!req.url.match(/^\/api\//)) return next();
  serverApi.handleRequest(req, res, next);
};

connect()
    .use(connect.static('dist'))
		.use(apiMiddleware)
		.listen(process.env.PORT || 3000);
