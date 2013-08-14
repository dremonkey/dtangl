'use strict';

/**
 * Custom D3 chart to display a simple x:y ratio
 *
 * Composed of two boxes, the smaller overlayed on top of the larger. The ratio of the area of the
 * smaller box to the area of the larger box is the same as specified x:y ratio.
 */

angular.module('d3.directives.box', ['common.utils', 'd3.services.color'])
  .directive('d3Box', function (_, d3Color) {

    // default pie chart options
    var defaults = {
      dur: 2500,
      len: 225,
      desc: 'default description',
      loadingColors: 'grayLight',
      chartColors: 'blueGray'
    };

    var directiveDefObj = {
      restrict: 'A',
      link: function (scope, element, attrs) {

        var
          opts = _.merge(defaults, attrs), // merge attributes with defaults
          svg = null, // container
          scale = null; // scaling function

        var
          loadingColors = d3Color.getRange(opts.loadingColors),
          colorscale = d3Color.getRange(opts.chartColors);

        // Add the container, set the width, height, and add the svg group
        svg = d3.select(element[0]).append('svg')
          .attr('height', opts.len + 30);

        // Retrieve the data
        scope.getData(attrs.display);

        /**
         * Determines which value of d3data to watch.
         * This is much faster than using the objectEquality parameter in $watch()
         * if you know in advance which value you should be watching for changes
         */
        var watch = function () {
          return scope.d3data[attrs.display];
        };
        
        scope.$watch(watch, function (newVal) {

          // if newVal is undefined or empty, exit
          if (!newVal) return;

          var data = newVal;

          var groups, group;

          scale = d3.scale.linear()
            .domain([
              d3.min(data, function (d) { return d.sections.average; }),
              d3.max(data, function (d) { return d.sections.average; })
            ])
            .range([1,4]);

          // add a new group for each item
          groups = svg.selectAll('g').data(data);

          group = groups.enter().append('g')
            .attr('transform', function (d, i) {
              return 'translate(' + i * (opts.len + 10) + ', 0)';
            });

          // add the large box
          group.append('rect')
            .attr('class', 'b1')
            .attr('width', opts.len)
            .attr('height', opts.len)
            .attr('fill', colorscale(0));

          group.append('rect')
            .attr('class', 'b2')
            .attr('y', function (d) {
              return opts.len - dimen(d, opts.len);
            })
            .attr('width', function (d) {
              return dimen(d, opts.len);
            })
            .attr('height', function (d) {
              return dimen(d, opts.len);
            })
            .attr('fill', colorscale(1));;

          group.append('text')
            .attr('class', 'ratio')
            .attr('text-anchor', 'end') // text-align: right
            .attr('y', 25)
            .attr('dy', '.35em') // vertical-align: middle
            .attr('x', opts.len)
            .attr('dx', -7) // padding-right
            .attr('font-size', 32)
            .text(function (d) { return d.ratio; });

          group.append('text')
            .attr('class', 'desc')
            .attr('text-anchor', 'middle') // text-align: right
            .attr('fill', '#333')
            .attr('x', opts.len/2)
            .attr('y', opts.len + 20)
            .attr('dy', '.35em') // vertical-align: middle
            .text(function (d) { return d.name; });
          
        });

        function dimen (d, len) {
          var
            val = 0,
            arr = d.ratio.split(':'),
            area = len * len;

          val = Math.sqrt(area / (arr[0] / arr[1]));

          // arbitrary adjustment to make difference more visually significant
          val += 15 / scale(d.sections.average);
          // console.log(d.ratio, scale(d.sections.average));

          return val;
        }
      }
    };

    return directiveDefObj;
  });