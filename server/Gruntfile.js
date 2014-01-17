'use strict';

var path = require('path');

/** 
 * Directory and File Path Configuration
 */

var paths = {

  // Server Directory and Paths
  srv: {
    tld: __dirname, // directory path to top level
    dirs: {},
    files: {
      scripts: [
        '<%= paths.srv.tld %>/**/*.js',
        '!<%= paths.srv.tld %>/node_modules/**/*.js'
      ]
    }
  },

  heroku: {
    tld: path.normalize(__dirname + '../../_heroku'),
    dirs: {
      server: '<%= paths.heroku.tld %>/server'
    }
  }
};

module.exports = function (grunt) {

  /**
   * Register all Grunt Tasks
   */

  // Run 'grunt dev' for live-reloading development environment
  grunt.registerTask('dev', ['env:dev', 'build:dev', 'concurrent:dev', 'server:dev']);

  // Run 'grunt dist' to build and run the distribution environment
  grunt.registerTask('stage', ['env:stage', 'server:stage']);

  // Run 'grunt heroku' to prepare the server for deployment to heroku
  grunt.registerTask('heroku', ['build:heroku']);

  // Clean, validate & compile web-accessible resources
  grunt.registerTask('build:dev', ['jshint']);
  grunt.registerTask('build:heroku', ['jshint', 'clean:heroku', 'copy:heroku']);

  // Start the express server and open the site in a browser
  grunt.registerTask('server:dev', ['open:dev', 'express:dev']);
  grunt.registerTask('server:stage', ['express:stage', 'open:stage', 'express-keepalive']);


  /**
   * Grunt Configurations
   */

  grunt.initConfig({

    paths: paths,

    env: {
      dev: {
        NODE_ENV: 'local'
      },
      stage: {
        NODE_ENV: 'stage'
      }
    },

    concurrent: {
      dev: {
        options: {
          logConcurrentOutput: true
        },
        tasks: []
      }
    },

    // Express requires 'server.js' to reload from changes
    express: {
      options: {
        hostname: 'localhost',
      },
      dev: {
        options: {
          port: 9000,
          server: '<%= paths.srv.tld %>/server.js',
          serverreload: true,
          // livereload: true,
          // bases: ['<%= paths.client.tld %>/src']
        }
      },
      stage: {
        options: {
          port: 9000,
          server: '<%= paths.srv.tld %>/server.js'
        }
      }
    },

    // Wipe the compiled files and/or build directory
    clean: {
      options: {
        force: true // lets us delete stuff outside the current working directory
      },
      
      // Remove the heroku/server directory
      heroku: {
        files: [{
          dot: true,
          src: '<%= paths.heroku.dirs.server %>'
        }]
      }
    },

    copy: {

      // Copy files from server -> heroku/server
      heroku: {
        files: [{
          expand: true,
          cwd: '<%= paths.srv.tld %>',
          src: [
            'config/config.base.js',
            'config/index.js',
            'server.js',
            'api/**/*'
          ],
          dest: '<%= paths.heroku.dirs.server %>'
        }]
      },
    },

    // Automatically open browser
    open: {
      dev: {
        url: 'http://localhost:<%= express.dev.options.port %>'
      },
      stage: {
        url: 'http://localhost:<%= express.stage.options.port %>'
      }
    },

    // Check javascript for errors
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        '<%= paths.srv.files.scripts %>'
      ]
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });


  /**
   * Load all dev grunt task dependencies
   */
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};
