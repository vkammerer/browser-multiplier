// The actual grunt server settings

var serverApi = require('../server/api');

module.exports =  function (grunt) {
  'use strict';
  var apiMiddleware = function(connect, options, middlewares) {
    middlewares.push(function(req, res, next) {
      if (!req.url.match(/^\/api\//)) return next();
      serverApi.handleRequest(req, res, next);
    });
    return middlewares;
  };
  return {
    options: {
      port: grunt.option('port') || 1337,
      livereload: grunt.option('livereload') || 35729,
      // Change this to '0.0.0.0' to access the server from outside
      hostname: grunt.option('hostname') || '0.0.0.0'
    },
    livereload: {
      options: {
        open: true,
        base: [
          '.tmp',
          '<%= config.app %>'
        ],
        middleware: apiMiddleware
      }
    },
    dist: {
      options: {
        open: true,
        base: '<%= config.dist %>',
        livereload: false,
        middleware: apiMiddleware
      }
    }
  };
};
