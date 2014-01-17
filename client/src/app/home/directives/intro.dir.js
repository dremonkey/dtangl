'use strict';

angular.module('home.directives', [])
  .directive('homeIntro', function () {
    var directiveDefinitionObject = {

      priority: 10,

      link: function () {
        console.log('intro');

        /*jshint newcap:false */

        // skrollrStylesheets.applyKeyframes();

        // var $bg = angular.element(element[0].querySelector('.bg'));
        // Caman('#bg-intro', '/images/sf.jpg', function () {
        //   this.stackBlur(10).render();
        // });
      }
    };

    return directiveDefinitionObject;
  });