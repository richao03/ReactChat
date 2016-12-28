'use strict';

/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');

var socket = require('./routes/socket.js');

var app = express();
var server = http.createServer(app);

/* Configuration */
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));



/* Socket.io Communication */
var io = require('socket.io').listen(server);
io.sockets.on('connection', socket);

/* Start server */
server.listen(3000, function (){
  console.log('Server listening on 3 million!');
});

module.exports = app;
