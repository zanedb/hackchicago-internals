const express = require('express');
const bodyParser = require('body-parser');
const ip = require("ip");
const opn = require('opn');
const path = require('path');
const fs = require('fs');

// define express
let server = express();

// configure body parser
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// define port to run server on
let port = process.env.PORT || 3000;

// route requests to HTML files
let publicdir = __dirname + '/public';
server.use(function(req, res, next) {
  if (req.path.indexOf('.') === -1) {
    var file = publicdir + req.path + '.html';
    fs.exists(file, function(exists) {
      if (exists)
        req.url += '.html';
      next();
    });
  }
  else
    next();
});
server.use(express.static(publicdir));

// start server
server.listen(port);
console.log('Running locally at http://localhost:'+port)
console.log('Running on your network at http://'+ip.address()+':'+port);
opn('http://localhost:'+port);
