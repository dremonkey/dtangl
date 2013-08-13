'use strict';

angular.module('d3', ['d3.controllers', 'd3.directives']);

// All d3 controllers
angular.module('d3.controllers', ['d3.controllers.data']);

// All d3 services
angular.module('d3.services', ['d3.services.data']);

// All d3 directives
angular.module('d3.directives', [
    'd3.directives.bar',
    'd3.directives.box',
    'd3.directives.legend',
    'd3.directives.pie',
    'd3.directives.sunburst',
    'd3.directives.tree',
  ]);