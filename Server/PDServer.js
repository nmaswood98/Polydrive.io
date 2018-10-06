/// <reference path="game.js"/>
/// <reference path="WorldItems.js"/>

var HTMLElement = typeof HTMLElement === 'undefined' ? function(){} : HTMLElement;
var ayy = require('./game.js');

var Primus = require('primus')

var path = require('path');
var express = require('express');
var http = require('http');
//var socketIO = require('socket.io');

var publicPath = path.join(__dirname + "/..");
var app = express();
var server = http.createServer(app);
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
app.use("/primus/primus.js", express.static(publicPath + 'node_modules/primus/primus.js'));

var primus = new Primus(server, {port: 3000, transformer: 'websockets',parser: 'JSON',pingInterval:0});

primus.on('connection', function (spark) {
  var bufArr = new ArrayBuffer(4);
        var bufView = new Uint8Array(bufArr);
        bufView[0]=6;
        bufView[1]=7;
        bufView[2]=8;
        bufView[3]=9;
        var arr = [];
        arr.push(100000);
        for(var i = 0;i< 10000;i++)
          arr.push(i);
          var bufArr = new ArrayBuffer(1);
        var bufView = new Uint8Array(bufArr);
        bufView[0]=1;
  spark.write(arr);
});

app.get('/', function(req, res) {


    

    res.sendFile(path.join(publicPath + '/Client/index.html'));
  //  console.log("hello");
});








server.listen(80, function () {
  //  console.log('server is up biath');

});




var game = Object.create(ayy.Game);
game.init(server);
game.tick();