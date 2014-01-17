'use strict';

/**
 * Proxies specific API calls to Clever
 */

var
  _ = require('lodash'),
  url = require('url'),
  rest = require('request');

var routes = function (app) {

  // List of collections that can be called via this proxy
  var whitelist = ['districts', 'schools', 'sections', 'students', 'teachers'];

  // Clever API Key
  var apiKey = 'DEMO_KEY';

  // Clever API URL Configuration Object
  var cleverUrl = {
    hostname: 'api.getclever.com',
    protocal: 'https:',
    auth: apiKey + ':'
  };

  /**
   * Utility function to map local requests to clever api endpoint. For example:
   *
   * /api/students/ -> https://USER:PASS@api.getclever.com/[ver]/students/
   * /api/students/:id -> https://USER:PASS@api.getclever.com/[ver]/students/:id
   * /api/students/:id/sections -> https://USER:PASS@api.getclever.com/[ver]/students/:id/sections
   */
  function mapUrl (reqUrlString, reqParams) {
    var
      reqUrl = url.parse(reqUrlString),
      ver = '1.1',
      path = reqUrl.path.slice(reqUrl.path.indexOf(/api/) + 5);

    // replace param placeholders with actual values in path
    if (reqParams) {
      for (var key in reqParams) {
        // ensure that the key is not from the prototype
        if (reqParams.hasOwnProperty(key)) {
          path = path.replace(':' + key, reqParams[key]);
        }
      }
    }

    cleverUrl.path = cleverUrl.pathname = '/v' + ver + '/' + path;

    var endpoint = cleverUrl.protocal + url.format(cleverUrl);

    console.log('urlObj:', cleverUrl, 'endpoint:', endpoint, 'reqParams:', reqParams);

    return endpoint;
  }


  /**
   * Utility function to check if current request is whitelisted
   */
  function isWhitelisted (collection) {
    return _.find(whitelist, function (val) {
      return collection === val;
    });
  }

  function renderJSON (req, res) {
    var endpoint = mapUrl(req.route.path, req.params);
    rest.get({url: endpoint, qs: req.query}, function (err, _res, data) {
      if (!err && 200 === _res.statusCode) {
        res.json(JSON.parse(data));
      }
      else if (!err) {
        res.json({error:'Error ' + _res.statusCode + ': Resource retrieval problem'});
      }
      else {
        res.json({error:err.stack});
      }
    });
  }

  // Define the api routing
  app.namespace('/api', function () {

    app.namespace('/:collection', function () {

      app.get('/', function (req, res, next) {
        if (isWhitelisted(req.params.collection)) {
          renderJSON(req, res);
          return;
        }
        next();
      });

      app.get('/:id', function (req, res, next) {
        if (isWhitelisted(req.params.collection)) {
          renderJSON(req, res);
          return;
        }
        next();
      });

      app.get('/:id/:relation', function (req, res, next) {
        if (isWhitelisted(req.params.relation)) {
          renderJSON(req, res);
          return;
        }
        next();
      });
    });
  });
};

module.exports = routes;