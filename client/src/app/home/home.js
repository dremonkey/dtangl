'use strict';

angular.module('home', ['home.controllers', 'ui.compat', ])
  .config(function ($stateProvider) {

    // console.log($templateCache);

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'home/templates/infographic.tpl.html',
        controller: 'HomeCtrl'
      });
  });