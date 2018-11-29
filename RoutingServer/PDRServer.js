/// <reference path="../GameServer/game.js"/>
/// <reference path="../GameServer/WorldItems.js"/>

var HTMLElement = typeof HTMLElement === 'undefined' ? function(){} : HTMLElement;
var Game = require('../GameServer/game.js').Game;
var Server = require('../GameServer/server.js').Server;

var request = require('request');

var Primus = require('primus'), Socket = Primus.createSocket({ transformer: 'websockets', parser: 'binary' });

var path = require('path');
var express = require('express');
var http = require('http');
//var socketIO = require('socket.io');

var publicPath = path.join(__dirname + "/..");
var app = express();
var HTTPserver = http.createServer(app);
//var io = socketIO(server);
console.log(path.join(publicPath));



app.use(express.static(publicPath));
console.log(__dirname);
app.use("/Client/index.html", express.static(publicPath + '/Client/index.html'));
app.use("/pixi.js", express.static(publicPath + '/Assets/pixi.js'));

app.use("/client.js", express.static(publicPath + '/Client/client.js'));
app.use("/game.js", express.static(publicPath + '/Client/game.js'));
app.use("/menu.js", express.static(publicPath + '/Client/menu.js'));

app.use("/polydriveSpriteSheet.png", express.static(publicPath + '/Assets/polydriveSpriteSheet.png'));
app.use("/polydriveSpriteSheet.json", express.static(publicPath + '/Assets/polydriveSpriteSheet.json'));


app.use("/socket.io/socket.io.js", express.static(publicPath + 'node_modules/socket.io/socket.io.js'));
app.use("/primus/primus.js", express.static(publicPath + '/Assets/primus.js'));


var eastCoastClient = new Socket("ws://192.168.1.217:5000");
eastCoastClient.playerCount = 0;
eastCoastClient.write(["playerCount"]);

eastCoastClient.on('data', function (data) {
 
  eastCoastClient.playerCount = data[1];
});




app.get('/GameServer/:location', function(req, res) {

    
      var serverIP = "192.168.1.185:5000";
   
    
          if(eastCoastClient.playerCount < 101)
              res.send("ws://192.168.1.185:5000");
          else
              res.send("0");
         
 
            

});


app.get('/', function(req, res) {
  
    res.sendFile(path.join(publicPath + '/Client/index.html'));
  //  console.log("hello");
});

HTTPserver.listen(80, function () {
  //  console.log('server is up biath');

});




