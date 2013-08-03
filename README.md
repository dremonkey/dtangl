# Heroku Deployment
The philosophy behind the deployment strategy outlined here is to avoid committing compiled files to the repository unnecessarily in order to keep the repository clean. Furthermore, I wanted to run all my tests and package the source up before pushing it out.

## Deployment Steps

Create a new top level directory called '_heroku' and create a [new heroku app](https://devcenter.heroku.com/articles/nodejs) using the Heroku Toolbelt.
    mkdir _heroku
    heroku create

In your new Heroku app, set the NODE_ENV environment variable to 'production'
    NODE_ENV = 'production'

Run the deploy.sh script in the bin directory.
    cd bin; ./deploy.sh

This script runs all the tests and grunt tasks to nicely package up the necessary client and server files that will be needed for the site and puts them into the _heroku directory you just created. Once all the necessary files have been packaged up, it does a git commit and pushes the files to Heroku. 

## Dependencies
- [Heroku Toolbelt](https://toolbelt.heroku.com/)