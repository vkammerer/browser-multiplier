// The actual grunt server settings

var apiServer = require('../api/server');

module.exports =  function (grunt) {
  'use strict';
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
        middleware: function(connect, options, middlewares) {
          middlewares.push(function(req, res, next) {
            if (!req.url.match(/^\/api\//)) return next();
            apiServer.handleRequest(req, res, next);
          });
          return middlewares;
        }
      }
    },
    dist: {
      options: {
        open: true,
        base: '<%= config.dist %>',
        livereload: false
      }
    }
  };
};
