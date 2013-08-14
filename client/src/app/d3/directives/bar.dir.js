'use strict';

angular.module('d3.directives.bar', ['common.utils'])
  .directive('d3Bar', function (_) {

    var defaults = {
      width: 320,
      barHeight: 20,
      anchor: 'left',
      loadingColors: 'grayLight',
      chartColors: 'blueGray'
    };

    var directiveDefObj = {
      restrict: 'A',

      // link is run once per directive tag in the template.
      link: function (scope, element, attrs) {

        var
          opts = _.merge(defaults, attrs), // merge attributes with defaults
          svg = null; // container

        // setup the svg object
        svg = d3.select(element[0]).append('svg')
          .attr('class', 'bar-chart')
          .attr('width', opts.width);

        // Retrieve the data
        scope.getData(attrs.display);

        /**
         * Determines which value of d3data to watch
         */
        var watch = function () {
          return scope.d3data[attrs.display];
        };

        scope.$watch(watch, function (newVal) {

          // if newVal is undefined, exit
          if (!newVal) return;

          // merge attributes with defaults because scope of options is not isolated
          // TODO figure out why and fix this
          opts = _.merge(defaults, attrs);

          var
            data = newVal,
            height = (opts.barHeight + 2) * data.length;

          // set the height on the svg object
          svg.attr('height', height);

          var x = d3.scale.linear()
            .domain([0, d3.max(data, function (d) { return d.count; })])
            .range([0, opts.width]);

          var y = d3.scale.linear()
            .domain([0, data.length])
            .range([0, height]);

          // bind the data to any existing groups
          var groups = svg.selectAll('g').data(data);

          // for all unbound data add new groups
          var group = groups.enter().append('g')
            .attr('letter', function (d) { return d.name; })
            .attr('transform', function (d, i) {
              return 'translate(0, ' + y(i) + ')';
            });

          group.append('rect')
            .attr('width', function (d) { return x(d.count); })
            .attr('x', function (d) {
              return 'right' === opts.anchor ? opts.width - x(d.count) : 0;
            })
            .attr('height', opts.barHeight);

          group.append('text')
            .attr('class', 'count')
            .attr('x', function (d) {
              return 'right' === opts.anchor ? opts.width - x(d.count) : x(d.count);
            })
            .attr('y', function () { return opts.barHeight/2; })
            // padding-right (or left)
            .attr('dx', function () {
              return 'right' === opts.anchor ? 3 : -3;
            })
            // vertical-align: middle
            .attr('dy', '.35em')
            // text-align
            .attr('text-anchor', function () {
              return 'right' === opts.anchor ? 'start' : 'end';
            })
            .attr('fill', 'white')
            .text(function (d) {
              return d.count < 10 ? '' : d.count;
            });

          group.append('text')
            .attr('y', function () { return opts.barHeight/2; })
            .attr('x', function () {
              return 'right' === opts.anchor ? opts.width : 0;
            })
            // padding-right (or left)
            .attr('dx', function () {
              return 'right' === opts.anchor ? -3 : 3;
            })
            .attr('dy', '.35em') // vertical-align: middle
            // text-align
            .attr('text-anchor', function () {
              return 'right' === opts.anchor ? 'end' : 'start';
            })
            .attr('fill', 'white')
            .text(function (d) { return d.name; });
        });
      }
    };

    return directiveDefObj;
  });