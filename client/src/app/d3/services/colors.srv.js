'use strict';

angular.module('d3.services.color', [])
  .factory('d3Color', function () {
    // Color Combinations
    var colors = {};

    var _groups = {
      grayLight: ['#f5f5f5','#e5e5e5', '#d5d5d5', '#c5c5c5'],
      blueGray: ['#B9C7D1', '#B0BBC3', '#75889A', '#4B6A87'],
      bluePurple: ['#98abc5', '#8a89a6', '#7b6888', '#6b486b'],
      // pastel: ['#6C77CB', '#49AEB6', '#99C329', '#DD9E35'],
      orgb: ['#DD9E35', '#C33B0E', '#99C329', '#49AEB6'],
      torg: ['#EEE9DD', '#C33B0E', '#99C329', '#DD9E35', '#49AEB6']
    };

    colors.getRange = function (type) {
      if (!(type in _groups)){
        throw 'Color range ' + type + 'is not defined';
      }

      return d3.scale.ordinal().range(_groups[type]);
    }

    return colors;
  });