module.exports = {
  options: {
    config: '.eslintrc'
  },
  target: [
    '<%= config.app %>/src/**/**.js',
    '<%= config.app %>/iframe/**/**.js',
    'server/**/**.js'
  ]
};
