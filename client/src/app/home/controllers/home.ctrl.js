'use strict';

angular.module('home.controllers', [])
  .controller('HomeCtrl', function () {

    // TODO Create a directive and move this into there
    // DOM manipulations don't belong here
    skrollr.init();
  });