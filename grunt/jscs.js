module.exports = {
  src: [
    '<%= config.app %>/src/**/**.js',
    '<%= config.app %>/iframe/**/**.js',
    'server/**/**.js',
    'Gruntfile.js'
  ],
  options: {
    config: '.jscsrc'
  }
};
