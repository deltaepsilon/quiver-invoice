// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'app/env.js',
      'app/lib/angular/angular.js',
      'app/lib/angular-mocks/angular-mocks.js',
      'app/lib/angular-sanitize/angular-sanitize.js',
      'app/lib/angular-cache/dist/angular-cache.js',
      'app/lib/angular-google-analytics/src/angular-google-analytics.js',
      'app/lib/angular-ui-router/release/angular-ui-router.js',
      'app/lib/jquery/jquery.js',
      'app/lib/lodash/dist/lodash.js',
      'app/lib/modernizr/modernizr.js',
      'app/lib/momentjs/moment.js',
      'app/lib/restangular/dist/restangular.js',
      'app/lib/firebase/firebase.js',
      'https://cdn.firebase.com/js/simple-login/1.2.1/firebase-simple-login.js',
      'app/lib/angularfire/angularfire.js',
      'app/lib/angular-notifications/notification.js',
      'app/scripts/*.js',
      'app/scripts/**/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
