'use strict';

angular.module('home', ['home.controllers', 'ui.compat', ])
  .config(function ($stateProvider) {

    // console.log($templateCache);

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'home/templates/infographic.tpl.html',
        // templateProvider: function () {
        //   var tpl = $templateCache.get('home/templates/infographic.tpl.html');
        //   console.log(tpl);
        //   return tpl;
        // },
        controller: 'HomeCtrl'
      });
  });