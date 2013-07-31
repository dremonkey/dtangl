# Heroku Deployment
The general philosophy behind the deployment strategy outlined here is to avoid committing compiled files to the repository unnecessarily in order to keep the repository clean. So all compilation will be done on Heroku after the files have been pushed up. This is accomplished with the help of the [heroku-buildpack-nodejs-grunt](https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt.git).

Add the [heroku-buildpack-nodejs-grunt](https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt.git) to this app.
  heroku config:add BUILDPACK_URL=https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt.git

Enable config vars during compile  
  heroku labs:enable user-env-compile -a dtangl

Set the NODE_ENV environment variable to 'production'
  NODE_ENV = 'production'

## Dependencies
- [heroku-buildpack-nodejs-grunt](https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt.git)