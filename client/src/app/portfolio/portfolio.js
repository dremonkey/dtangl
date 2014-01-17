'use strict';

angular.module('portfolio', ['ui.compat', 'portfolio.directives'])
  .config(function ($stateProvider, $urlRouterProvider) {

    // TODO figure out how to use a regex to redirect any portfolio/* url to its portfolio/*/ state
    $urlRouterProvider
      .when('/portfolio/clever', '/portfolio/clever/');

    $stateProvider
      .state('portfolio', {
        url: '/portfolio/',
        templateUrl: 'home/templates/home.tpl.html'
      })
      .state('clever', {
        url: '/portfolio/clever/',
        templateUrl: 'portfolio/templates/clever.tpl.html'
      });
  });