'use strict';

angular.module('d3.controllers.data', ['ngResource', 'common.utils', 'd3.services.data'])
  
  .controller('D3DataCtrl', function ($scope, $resource, $q, _, d3dataCache) {
    
    var
      promises = [],
      d3data = {children:[], 'id':'', level: 'district'}; // Setup initial d3data object

    d3dataCache.getSchools().then(function (res) {

      var
        schools = res,
        schoolIDs = _extractIds(schools.data);
      
      d3data.id = schools.data[0].data.district;

      // Add the sections data
      _.each(schoolIDs, function (val) {
        
        var promise = _buildSections(val);

        // Bundle the promise
        promises.push(promise);
        
        // Add data to d3data object when promise has resolved
        promise.then(function (data) {
          _buildD3Data(data.schoolID, data.sections);
        });
      });

      // Once all data has been retrieved, save the data to the scope
      $q.all(promises).then(function () {
        $scope.d3data = d3data;
      });
    });


    /**
     * Utility function used to parse the data object and extract the ids
     *
     * @return (array) list of ids
     */
    function _extractIds (data) {
      return _.map(data, function (val) {
        return val.data.id;
      });
    }


    /**
     * Build school sections data with student information
     *
     * @return (array) list of sections
     */
    function _buildSections (schoolID) {

      var q = $q.defer();

      d3dataCache.getSchools(schoolID, 'sections').then(function (res) {

        var sections = res,
          list = [];
        
        _.each(sections.data, function (val) {
          var id = val.data.id;
          var size = val.data.students.length;
          list.push({
            // children:[{name:'students', size: size}],
            id: id,
            level: 'section',
            size: size
          });
        });

        q.resolve({schoolID: schoolID, sections: list});
      });

      return q.promise;
    }


    /**
     * Utility function to push the retrieved data to the d3data object 
     * that will be assigned to $scope
     */
    function _buildD3Data (schoolID, sections) {
      d3data.children.push({
        children: sections,
        id: schoolID,
        level: 'school'
      });
    }

  })

  .controller('D3SimpleDataCtrl', function ($scope, $resource, $q, _, utils, d3dataCache) {

    console.log('D3SimpleDataCtrl');

    $scope.d3data = {};

    // Expose getData to the directive
    $scope.getData = function (type) {

      var data, real, tmp;

      var
        schools = null,
        promises = [];

      switch (type) {
      case 'schools':

        real = {total: 0, data: []};

        d3dataCache.getSchools().then(function (res) {
          schools = res.data;
          
          _.each(schools, function (school) {
            real.data.push({
              name: school.data.name
            });
          });

          real.total = schools.length;
          $scope.d3data[type] = real;
        });
        break;
      case 'studentsInSchools':
      case 'teachersInSchools':
      case 'sectionsInSchools':

        tmp = {total: 0, data: []};
        real = {total: 0, data: []};

        var rel = '';
        switch (type) {
        case 'studentsInSchools':
          rel = 'students';
          break;
        case 'teachersInSchools':
          rel = 'teachers';
          break;
        case 'sectionsInSchools':
          rel = 'sections';
          break;
        }

        d3dataCache.getSchools().then(function (res) {

          schools = res.data;

          _.each(schools, function (school) {

            // setup the temp data
            var count = utils.getRandomInt(1,10);

            tmp.data.push({
              name: school.data.name,
              count: count
            });

            tmp.total += count;
            
            // set up parameters to retrieve the real data
            var params = {
              id: school.data.id,
              rel: rel,
              count: true
            };

            // retrieve the school specific information
            var promise = d3dataCache.getSchools(params).then(function (res) {

              real.data.push({
                name: school.data.name,
                count: res.count
              });

              real.total += res.count;
            });

            promises.push(promise);
          });

          // assign temporary data to scope
          $scope.d3data[type] = tmp;

          // Once all data has been retrieved, save the real data to the scope
          $q.all(promises).then(function () {
            $scope.d3data[type] = real;
          });

        });

        break;
      // Returns the average size of a section in each school... assuming 1 teacher per
      // section this is equivalent to the student teacher ratio
      case 'studentTeacherRatio':
      case 'averageSectionSize':

        data = [];

        // Expected datum structure
        //
        // {
        //   name: school.name,
        //   ratio: '30:1',
        //   sections: {
        //     average: 30,
        //     list: [
        //      {name: 'Section Name', id:'123', count:38}
        //     ]
        //   }
        // }


        d3dataCache.getSchools().then(function (res) {
          schools = res.data;

          _.each(schools, function (school) {

            var params = {
              id: school.data.id,
              rel: 'sections'
            };

            // retrieve the school specific information
            var promise = d3dataCache.getSchools(params).then(function (res) {
              
              var
                datum = {},
                sections = res.data,
                total = 0;

              datum.name = school.data.name;
              datum.sections = {};
              datum.sections.list = [];

              // Calculate the average number of students per section
              _.each(sections, function (val) {

                /* jshint camelcase:false */

                var section = val.data;

                datum.sections.list.push({
                  id: section.id,
                  name: section.course_name,
                  count: section.students.length
                });

                total += section.students.length;
              });

              datum.sections.average = total / datum.sections.list.length;
              datum.ratio = Math.round(datum.sections.average) + ':1';

              data.push(datum);
            });

            promises.push(promise);
          });

          // Once all data has been retrieved, save the real data to the scope
          $q.all(promises).then(function () {
            console.log(data);
            $scope.d3data[type] = data;
          });

        });
        
        break;
      case 'studentFirstNames':
      case 'studentLastNames':

        data = [];

        /**
         * Comparator function to be used as a callback for the grouping function. 
         * Will be passed the a single item from the dataset being grouped, and returns
         * the first character of the first/last name.
         *
         * @param val (mixed) a single item from the dataset array being grouped
         * @return (char) the first character of the first/last name
         */
        var comparator = function (val) {
          var key = 'studentFirstNames' === type ? val.data.name.first : val.data.name.last;
          return key.charAt(0);
        };

        var params = {
          limit: null,
          sort: 'studentFirstNames' === type ? 'name.first' : 'name.last'
        };

        d3dataCache.getStudents(params).then(function (res) {
    
          // Group the students and assign to scope
          var grouped = _groupABC(res.data, comparator, 'mergesort');

          // format the data
          _.each(grouped, function (val, key) {
            data.push({
              name: key,
              children: val,
              count: val.length
            });
          });
          
          $scope.d3data[type] = data;
        });

        break;
      }
    };


    /**
     * _groupABC
     *
     * Groups a dataset alphabetically according to a previously defined comparator 
     * optionally using a specified sorting method. 
     *
     * @uses _mergesort
     *
     * @param dataset (array) array of objects
     * @param comparator (func) function that returns the value used to determine the item grouping
     * @param algo (string) algorithm to use to sort
     */
    function _groupABC (dataset, comparator, method) {
      var
        grouped = {},
        timer = method ? method + '::groupDataTimer' : 'linear::groupDataTimer',
        abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      
      // start the timer
      console.time(timer);

      switch (method) {
      // faster on sorted datasets
      case 'mergesort':
        grouped = _mergesort(dataset, comparator);
        break;
      // faster for unsorted datasets
      case 'linear':
        for (var i = dataset.length - 1; i >= 0; i--) {
          var key = comparator(dataset[i]);
          if (!(key in grouped)) {
            grouped[key] = [];
          }
          grouped[key].push(dataset[i]);
        }
        break;
      }

      // end timer
      console.timeEnd(timer);

      // 
      var sorted = {};

      // make sure all letters are present and alphabetically sorted
      _.each(abc, function (letter) {
        if (!(letter in grouped)) {
          sorted[letter] = [];
        }
        else {
          sorted[letter] = grouped[letter];
        }
      });

      return sorted;
    }


    /**
     * _mergesort
     *
     * Assumes the inputed data is already pre-sorted. This uses a mergesort like
     * process to group the data according to the comparator passed to it.
     *
     * @param dataset (array) the array of data to be grouped
     * @param comparator (func) function that returns the comparator value
     */
    function _mergesort (dataset, comparator) {

      var sorted = {}; // used to store the sorted data
      
      (function _sort (array) {

        var
          k1, k2,
          size = array.length;
        if (1 === size) {
          k1 = comparator(array[0]);
          if (!(k1 in sorted))
            sorted[k1] = [];
          // For joining two arrays array.push.apply is faster than array.concat
          sorted[k1].push.apply(sorted[k1], array);
        }
        else {
          
          k1 = comparator(array[0]);
          k2 = comparator(array[size - 1]);

          if (k1 === k2) {
            if (!(k1 in sorted))
              sorted[k1] = [];
            // For joining two arrays array.push.apply is faster than array.concat
            sorted[k1].push.apply(sorted[k1], array);
          }
          else {
            var
              pivot = Math.round(size/2),
              left = array.slice(0,pivot),
              right = array.slice(pivot);
            
            _sort(left);
            _sort(right);
          }
        }
      })(dataset);
      
      return sorted;
    }
  });