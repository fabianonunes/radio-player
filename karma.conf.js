// Karma configuration
// Generated on Tue Jan 19 2016 08:07:50 GMT-0200 (BRST)
'use strict'

var path = require('path')
var webpackConfig = require('./webpack.config.js')
webpackConfig.devtool = 'eval'

webpackConfig.module = {
  preLoaders: [{
    test: /\.js$/,
    include: path.resolve('modules'),
    loader: 'istanbul-instrumenter'
  }]
}

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine-jquery', 'jasmine-ajax', 'jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'test/test.webpack.js',
      { pattern: 'test/fixtures/*', included: false, served: true }
    ],

    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/test.webpack.js': ['webpack'],
      'modules/**/*.js': ['coverage']
    },

    webpack: webpackConfig,

    webpackServer: {
      noInfo: true // please don't spam the console when running in karma!
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    // reporters: ['spec', 'coverage'],
    reporters: ['progress'],

    coverageReporter: {
      type: 'text'
    },

    port: 9876,
    colors: true,

    // config (.LOG_DISABLE || .LOG_ERROR || .LOG_WARN || .LOG_INFO || .LOG_DEBUG)
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'Chrome'
    ],

    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
