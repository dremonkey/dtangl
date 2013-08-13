'use strict';

angular.module('d3.services.data', ['ngResource', 'common.utils'])
  .factory('d3dataCache', function ($cacheFactory, $resource, $q, _) {

    var
      cache = $cacheFactory('d3data'),
      Schools = $resource('/api/schools/:id/:rel'),
      Students = $resource('/api/students/:id/:rel');
      // Sections = $resource('/api/sections/:id/:rel');

    cache.getSchools = function (params) {
      return getCollection(Schools, 'schools', params);
    };

    cache.getStudents = function (params) {
      return getCollection(Students, 'students', params);
    };

    function getCollection (resource, base, _params) {

      var params = _params || {};
      
      var
        deferred = $q.defer(),
        key = getCacheKey(base, params),
        res = cache.get(key);

      // if cached then stop and return
      if (res) {
        deferred.resolve(res);
      }
      else {

        // otherwise retrieve the school(s) data
        res = resource.get(params, function () {

          // cache the data
          cache.put(key, res);

          // resolve with the data
          deferred.resolve(res);
        });
      }

      // return the promise always
      return deferred.promise;
    }


    function getCacheKey (base, params) {
      
      var _tmp = params;
      var key = _.isEmpty(params) ? base : base + '::' + JSON.stringify(_tmp);
      return key;
    }

    return cache;
  });