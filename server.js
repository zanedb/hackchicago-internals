const express = require('express');
const bodyParser = require('body-parser');
const Attendee = require('./app/models/attendee');
const ip = require("ip");
const opn = require('opn');
const path = require('path');
const fs = require('fs');

// define express
let server = express();

// configure body parser
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

let port = process.env.PORT || 3000;

// setup express router
const router = express.Router();

// handles all requests
router.use(function(req, res, next) {
  console.log('Request is being handled..');
  next(); // continue to next route
});

// route requests to html files
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

// api/attendees
router.route('/attendees')
  // create an attendee (accessed at POST http://localhost:3000/api/attendees)
  .post(function(req, res) {
    let attendee = new Attendee();
    // set attributes from request
    attendee.fname = req.body.fname;
    attendee.lname = req.body.lname;
    attendee.email = req.body.email;
    attendee.hex = ("hackchicago2018" + "/" + attendee.fname + "/" + attendee.lname + "/" + attendee.email).toUpperCase();

    var hex, i;
    var result = "";
    for (i=0; i<this.length; i++) {
      hex = this.charCodeAt(i).toString(16);
      result += ("000"+hex).slice(-4);
    }

    res.json({
      message: 'Attendee QR code created!',
      hex: attendee.hex
    });
  })
  // get all the attendees (accessed at GET http://localhost:3000/api/attendees)
  .get(function(req, res) {
    // TODO
    res.json({ message: 'TODO: Implement this' });
  });

// setup files to be served
//server.use(express.static('public'));
// prefix routes with /api
server.use('/api', router);

// start server
server.listen(port);
console.log('Running locally at http://localhost:'+port)
console.log('Running on your network at http://'+ip.address()+':'+port);
opn('http://localhost:'+port)
