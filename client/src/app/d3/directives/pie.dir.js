'use strict';

angular.module('d3.directives.pie', ['common.utils'])
  .directive('d3Pie', function (_) {
    
    // default pie chart options
    var defaults = {
      dur: 2500,
      chartWidth: 320,
      chartHeight: 320,
      desc: 'default description'
    };

    var
      grayscale = d3.scale.ordinal().range(['#f5f5f5','#e5e5e5', '#d5d5d5', '#c5c5c5']),
      color = d3.scale.ordinal().range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b']);

    var directiveDefObj = {
      restrict: 'A',

      // link is run once per directive tag in the template.
      link: function (scope, element, attrs) {

        var
          opts = _.merge(defaults, attrs), // merge attributes with defaults
          svg = null, // container
          radius = Math.min(opts.chartWidth, opts.chartHeight) / 2,
          innerRadius = radius - opts.chartWidth/8,
          init = true; // flag to keep track of initialization state

        var arcs;

        // Creates the arc data from a data array
        var pie = d3.layout.pie()
          // Set the value that will be used to construct the arc data
          // This is used for each item in the data array
          .value(function (d) { return d.count; });

        // Creates the 'path' elements from the arc data
        var arc = d3.svg.arc()
          .outerRadius(radius)
          .innerRadius(innerRadius);

        // Retrieve the data
        scope.getData(opts.display);

        // Add the container, set the width, height, and add the svg group
        svg = d3.select(element[0]).append('svg')
          .attr('width', opts.chartWidth)
          .attr('height', opts.chartHeight)
        .append('g')
          .attr('transform', 'translate(' + opts.chartWidth / 2 + ',' + opts.chartHeight / 2 + ')');

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

          var data = newVal.data;
          var total = newVal.total;

          // merge attributes with defaults because scope of options is not isolated
          // TODO figure out why and fix this
          opts = _.merge(defaults, attrs);

          if (init) {
            
            // add the arcs
            arcs = drawArcs(data);

            // set the styling of the arcs
            arcs
              .attr('fill', function (d) { return grayscale(d.data.name); });
            
            // save the current arc data for later use to calculate transitions
            arcs.each(function (d) {
              this.currentState = d;
              return d;
            });

            // add the label container
            drawLabel();

            // set initialization state to false
            init = false;
          }
          else {
            arcs = drawArcs(data);

            arcs
              .attr('count', function (d) {
                return d.data.count;
              })
              .attr('name', function (d) {
                return d.data.name;
              });

            // transition to new data
            arcs.transition()
              .duration(opts.dur)
              .attrTween('d', arcTween)
              .style('fill', function (d) {
                // set fill color depending on name
                return color(d.data.name);
              });

            updateCount(total);
          }
        });

        function drawArcs (data) {

          // bind the data to any existing arcs
          var arcs = svg.selectAll('.arc').data(pie(data));

          // for all unbound data add new arcs
          arcs.enter().append('path')
            .attr('class', 'arc')
            .attr('d', arc);

          return arcs;
        }


        function drawLabel () {
          var label;

          // Add the label container to the pie parent container
          label = svg.append('g')
            .attr('class', 'arc-label');
          
          // Add circle to the label group
          label.append('circle')
            .attr('r', innerRadius - 20)
            .attr('fill', 'transparent')
            .attr('transform', 'translate(0,0)');

          // Add loading text to the label group
          label.append('text')
            .attr('class', 'count')
            .attr('y', -3)
            .attr('dy', '.35em') // vertical-align: middle
            .attr('text-anchor', 'middle') // text-align: center
            .attr('font-size', '24')
            .attr('fill', '#e5e5e5')
            .text('Loading');
            
          // Add loading text to the label group
          label.append('text')
            .attr('class', 'desc')
            .attr('y', 20)
            .attr('dy', '.35em') // vertical-align: middle
            .attr('text-anchor', 'middle') // text-align: center
            .attr('fill', '#e5e5e5')
            .text(function () { return opts.desc; });
        }


        function updateCount (text, color) {
          color = color || '#e5e5e5';
          svg.selectAll('text.count')
            .attr('font-size', 36)
            .attr('fill', color)
            .text(text);
        }

        
        function arcTween (d) {
          /*jshint validthis:true */
          var interpolater = d3.interpolate(this.currentState, d);
          this.currentState = interpolater(0);
          return function(t) {
            return arc(interpolater(t));
          };
        }
      }
    };

    return directiveDefObj;
  });