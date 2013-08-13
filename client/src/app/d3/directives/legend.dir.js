'use strict';

angular.module('d3.directives.legend', ['common.utils'])
  .directive('d3Legend', function (_) {

    var defaults = {
      width: 200,
      height: 150
    };

    var
      // grayscale = d3.scale.ordinal().range(['#f5f5f5','#e5e5e5', '#d5d5d5', '#c5c5c5']),
      color = d3.scale.ordinal().range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b']);

    var directiveDefObj = {
      restrict: 'A',

      // link is run once per directive tag in the template.
      link: function (scope, element, attrs) {

        var
          opts = _.merge(defaults, attrs), // merge attributes with defaults
          svg = null; // container

        // Retrieve the data
        scope.getData(attrs.display);

        svg = d3.select(element[0]).append('svg')
          .attr('width', opts.width)
          .attr('height', opts.height);

        /**
         * Determines which value of d3data to watch.
         * This is much faster than using the objectEquality parameter in $watch()
         * if you know in advance which value you should be watching for changes
         */
        var watch = function () {
          return scope.d3data[attrs.display];
        };
        
        scope.$watch(watch, function (newVal) {
          // if newVal is undefined, exit
          if (!newVal) return;

          // console.log(newVal.length);
          var data = newVal.data;
          var total = newVal.total;

          var y = d3.scale.linear()
            .domain([0, total])
            .range([0, opts.height]);

          var x = d3.scale.linear()
            .domain([0, total])
            .range([0, opts.width]);

          var groups, group, gh;
          
          var
            bh = 15,
            bw = 15;

          // set the height of a group
          gh = 'vertical' === opts.layout ? Math.round(opts.height / total) : opts.height;

          // bind the data to any existing groups
          groups = svg.selectAll('g').data(data);

          // for all unbound data add new groups
          group = groups.enter().append('g')
            .attr('transform', function (d, i) {
              if ('vertical' === opts.layout)
                return 'translate(0,' + y(i) + ')';
              else
                return 'translate(' + x(i) + ', 0)';
            });

          group.append('rect')
            .attr('height', bh)
            .attr('width', bw)
            .attr('y', gh/2 - bh/2)
            .attr('fill', function (d) {
              console.log(d);
              return color(d.name);
            })
            .attr('class', 'color-box');

          group.append('text')
            .attr('y', gh/2 )
            .attr('x', bw + 5)
            .attr('fill', '#444444')
            .attr('dy', '.35em') // vertical-align: middle
            .text(function (d) {
              return d.name;
            });
        });
      }
    };

    return directiveDefObj;
  });