var connect = require('connect');
var serverApi = require('./api');

var apiMiddleware = function(req, res, next) {
  if (!req.url.match(/^\/api\//)) return next();
  serverApi.handleRequest(req, res, next);
};

connect()
		.use(apiMiddleware)
    .use(connect.static('./dist'))
		.listen(process.env.PORT || 3000);
