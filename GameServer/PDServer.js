/// <reference path="game.js"/>
/// <reference path="WorldItems.js"/>

var HTMLElement = typeof HTMLElement === 'undefined' ? function(){} : HTMLElement;
var Game = require('./game.js').Game;
var Server = require('./server.js').Server;

var Primus = require('primus');

var path = require('path');
var express = require('express');
var http = require('http');

var publicPath = path.join(__dirname + "/..");
var app = express();
var HTTPserver = http.createServer(app);



HTTPserver.listen(5000, function () {
  //  console.log('server is up biath');

});


var server = Object.create(Server);
server.init(HTTPserver);


