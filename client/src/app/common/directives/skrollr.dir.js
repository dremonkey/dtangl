'use strict';

angular.module('common.directives.skrollr', [])
  .directive('skrollr', function () {
    var directiveDefinitionObject = {

      link: function () {
        skrollr.init();
      }
    };

    return directiveDefinitionObject;
  });