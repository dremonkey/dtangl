'use strict';

angular.module('portfolio.directives', [])
  .directive('portfolioArchive', function () {
    var directiveDefinitionObject = {

      priority: 10,
      
      templateUrl: 'portfolio/templates/index.tpl.html',
      
      link: function () {
        console.log('portfolio');
        // skrollrStylesheets.applyKeyframes();
      }
    };

    return directiveDefinitionObject;
  });