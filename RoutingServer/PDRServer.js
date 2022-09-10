/// <reference path="../GameServer/game.js"/>
/// <reference path="../GameServer/WorldItems.js"/>

var fs = require('fs');

console.log(process.env.RAILWAY_STATIC_URL);
let gameServerIPs =  {"east": `${"polydriveio-production.up.railway.app"}:80`, "NA-East": `${"polydriveio-production.up.railway.app"}:80`};

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
//console.log(path.join(publicPath));



app.use(express.static(publicPath));
//console.log(__dirname);
app.use("/Client/index.html", express.static(publicPath + '/Client/index.html'));
app.use("/pixi.js", express.static(publicPath + '/Assets/pixi.js'));

var distrubtion = false; 

if (distrubtion) {
  app.use("/client.js", express.static(publicPath + '/Distribution/client.js'));
  app.use("/game.js", express.static(publicPath + '/Distribution/game.js'));
  app.use("/menu.js", express.static(publicPath + '/Distribution/menu.js'));
  app.use("/primus/primus.js", express.static(publicPath + '/Distribution/primus.js'));
}
else {
  app.use("/client.js", express.static(publicPath + '/Client/client.js'));
  app.use("/game.js", express.static(publicPath + '/Client/game.js'));
  app.use("/menu.js", express.static(publicPath + '/Client/menu.js'));
  app.use("/primus/primus.js", express.static(publicPath + '/Assets/primus.js'));
}




app.use("/polydriveSpriteSheet.png", express.static(publicPath + '/Assets/polydriveSpriteSheet.png'));
app.use("/polydriveSpriteSheet.json", express.static(publicPath + '/Assets/polydriveSpriteSheet.json'));


app.use("/socket.io/socket.io.js", express.static(publicPath + 'node_modules/socket.io/socket.io.js'));


var gameServerSockets = {};
Object.keys(gameServerIPs).forEach(function(k){
  let serverSocket = new Socket("ws://" + gameServerIPs[k]);
  serverSocket.playerCount = -1; //-1 if no response from the server
  serverSocket.write(["playerCount"]);
  serverSocket.on('data', function (data) {
 
    serverSocket.playerCount = data[1];
  });

  gameServerSockets[gameServerIPs[k]] = serverSocket;

});








app.get('/GameServer/:location', function(req, res) {
//"ws://192.168.1.185:5000"
    //console.log(req.params.location);
    if(gameServerIPs[req.params.location] !== undefined){
      let serverIP = gameServerIPs[req.params.location];
      let serverSocket = gameServerSockets[serverIP];
      if(serverSocket.playerCount < 101 && serverSocket.playerCount > -1)
              res.send("ws://" + serverIP);
          else
              res.send("0");

    }

});


app.get('/', function(req, res) {
  
    res.sendFile(path.join(publicPath + '/Client/index.html'));
  //  //console.log("hello");
});

HTTPserver.listen(80, function () {
  console.log('PDR Server is up');

});





