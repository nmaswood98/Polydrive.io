//Server ReWrite using Primus. 
/// <reference path="game.js"/>

var Collisions = require('detect-collisions').Collisions;

var Game = require('./game.js').Game;
var Primus = require('primus');

var Car = require('./WorldItems.js').WorldItems.Car;
var Vector = require('./WorldItems.js').WorldItems.Vector;

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

module.exports.Server = {
    init: function(server){
        this.updateRate = 60;
        var mainServer = null;
        var playerNames = {};

        var setName = (name) => { //there is probably a more
            if(playerNames[name] === name)
                return setName(name + '1');
            else
                return playerNames[name] = name;
        };

        var sendLeaderBoard = false;
        var primus = new Primus(server, {port: 5000, transformer: 'websockets',parser: 'binary',pingInterval:10000}); //Need To Change to uws
        var game = Object.create(Game);
        game.init(primus);

        this.getPlayerCount = function(){
            return game.players.length;
        };
        
        var validatePlayerPacket = function(data){
            if(data.length === 6){
                if(typeof data[1] != "number" || typeof data[2] != "boolean" || typeof data[3] != "boolean" || typeof data[4] != "boolean" || typeof data[5] != "object")
                    return false;
            }
            else{
                return false;
            }
            return true;
        };

        
        primus.on('connection', function (socket) { ///Need to refractor
            socket.inGame = false; 
            socket.spectating = false;
            socket.car = null;
            //console.log("Client Connected");
            
            sendUpdates();
            socket.on('data', function (data) {///data should always be an array
                switch(data[0]) {
                    case "spawn": ///might need to wait until recieved cilent movement to add into the world // ["spawn"]
                        //check if enough players
                        if(game.players.length < 101){
                        ///creates casr
                        socket.car = Car.create(socket.id,true, {x:(getRndInteger(0,game.worldX)),y:(getRndInteger(0,game.worldY))},game.system);
                        socket.car.followerArray = [];
                        socket.car.garageCount = 0;

                        socket.car.addFromGarage = function(){
                            if(this.garageCount > 0){
                                this.garageCount--;
                                this.manaCount -= 10;
                                game.newCarFollower(this);
                            }
                        };
                        
                        socket.car.removeManaArray = [];
                        socket.car.socket = socket; 
                        
                       
                        socket.car.name = setName(data[1]);


                        socket.car.carIndex = data[2];

                        socket.write([1,socket.car.position.x,socket.car.position.y,game.worldSizeType]); //Replace with actual Welcome Message
                        
                        socket.car.speed = 5;
                        socket.car.rClick = false;
                        game.players.push(socket.car);
                        
                        if(mainServer != null)
                            mainServer.write([4,game.players.length]);
                        else
                            console.log("Line 93 Shouldn't Run");

                        socket.inGame = true;
                        //console.log("REACHED LINE 86 BEFORE CRASH");
                        }
                        else{
                            socket.write([5]);
                        }
                        break;
                    case "playerTick": //["playerTick",angle,stopped,leftClick,rightClick,launchedCar]
                        let carInfo = data[1];

                        if(socket.inGame && validatePlayerPacket(data)){
                            if(data[5] != null){
                                let launchedCar = data[5];
                                var carFound = socket.car.followerArray.find(c => c.id === launchedCar.id);
                                if(carFound != undefined){
                                    carFound.launching = true;
                                    carFound.hitCar = false;
                                    carFound.launchAngle = Math.atan2((launchedCar.mY - launchedCar.y), (launchedCar.mX - launchedCar.x)) - (Math.PI);

                                    setTimeout(function () { 

                                        carFound.launching = false; 

                                        if(!carFound.hitCar){
                                            var index = carFound.follower.followerArray.indexOf(carFound);
                                            carFound.follower.followerArray.splice( index, 1 );
                                            carFound.cBody.remove();


                                        }
                                    }, 1000); //amount of time the car will launch for

                                  }
                                  else{
                                      console.log("ERROR: CLIENT SENT NONEXISTANT ID");
                                  }
                            }
                            socket.car.rClick = data[4];
                            socket.car.lClick = data[3];

                            if (data[2] == false){
                                socket.car.stopped = false;
            
                                if (socket.car.speed >= 4.8 && socket.car.speed <= 5.1) {
                                    socket.car.speed = 5;
                                }
                                
                                if (socket.car.speed < 5) { 
                                    socket.car.speed += 0.2; 
                                }
                                else if (data[3] === true || data[4] === true) {
                                    if (socket.car.speed <= 15) {
                                    socket.car.speed += 0.35;
                                    }
                                }
                                else if (socket.car.speed > 5) {
                                    socket.car.speed = socket.car.speed * 0.96;
                                }
                                    game.moveCar(1,socket.car, data[1], socket.car.speed);
                            }
                            else{ 
                                socket.car.speed = socket.car.speed * 0.95;
                                socket.car.stopped = true;
                                game.moveCar(1,socket.car, data[1], socket.car.speed);
                            }
                            
                        }

                        break;
                    case "playerCount": //playerCount
                        socket.write([4,game.players.length]);
                        if(mainServer === null)
                            mainServer = socket;
                        break;
                    default:
                        console.log("ERROR: Client sent packet unrecognized by server");
                        socket.end();
                }

            });

            socket.kick = (followerCount) =>{
                var index = game.players.indexOf(socket.car);
                if (index > -1) {
                    delete playerNames[socket.car.name];
                    //Creates object containg information from the dead player in order to continue sending updates to client that is spectating. 
                    game.players.splice(index, 1);
                    if(mainServer != null)
                        mainServer.write([4,game.players.length]);

                    
                    if(socket.car.followerArray.length > 0){
                        socket.car.followerArray.forEach(elem => {
                            elem.cBody.remove();
                        });
                    }

                    socket.car.followerArray = [];
                    socket.car =  {spectating:true, position: {x:socket.car.position.x, y:socket.car.position.y},id: socket.id, followerCountAtDeath:followerCount, removeManaArray:socket.car.removeManaArray}; 
                
                    socket.inGame = false;
                    socket.spectating = true;
                  
                }
                else{
                    console.log("ERROR at 135, THIS SHOULDN'T RUN");
                }
                socket.write([2]); ///update in lcinet
                //socket.car = null;
                setTimeout( () => {  
                    socket.spectating = false;

                    if(!socket.inGame)
                        socket.car = null;

                }, 5000);

            };
    
        });

        primus.on('disconnection', function (socket) {
           //disconnect code
           //console.log("Disconnecting Socket0");
           if(socket.inGame){
               delete playerNames[socket.car.name];
           var index = game.players.indexOf(socket.car);

           if (index > -1) {
            game.players.splice(index, 1);
            socket.car.followerArray.forEach(elem => {
                elem.cBody.remove();
            });
            socket.car.cBody.remove(); //removes body from collision system
        }
        }
        if(mainServer != null)
            mainServer.write([4,game.players.length]);
        });

        function compare(a,b){
            if(a.manaCount < b.manaCount)
                return 1;
            else if (b.manaCount > a.manaCount)
                return -1;
            return 0;
        };

        const sendUpdates = ()=>{
            //LeaderBoard Creations
            let currentLB = [3];
            if(sendLeaderBoard){
                game.players.sort(compare);
                for(let i = 0; i < Math.min(10,game.players.length);i++){
                    let player = game.players[i];
                    currentLB.push(player.name,player.manaCount);
                }
            }

            primus.forEach(function (socket, id, connections) {//socket.car contains the car information, socket.car.followerArray etc
              if(socket.inGame || socket.spectating ){
                var d = new Date();
                let snapShot = createSnapShot(socket.car);
                snapShot.push(Date.now());

                socket.write(snapShot);

                if(sendLeaderBoard)
                    socket.write(currentLB);

              }
              });

            sendLeaderBoard = false;
        };

        const createSnapShot = (car)=>{
            
            let snapShot = [0];

            let scale = 1, amount = (car.spectating) ?  car.followerCountAtDeath : car.followerArray.length;
            if(amount > 15 && amount < 200)
                scale = 0.009467213*amount + 1.090164;
            else if (amount >=200)
                scale = 0.005*amount + 2;

            let drawWidth = 2000 * scale, drawHeight = 1000 * scale; //Default Draw Distance betwen cars
            let maxX = car.position.x + drawWidth, maxY = car.position.y + drawHeight, minX = car.position.x - drawWidth, minY = car.position.y - drawHeight;



            ///Bug 
            primus.forEach(function (socket, id, connections) {
                if(socket.inGame){ //Checks if the Socket is in the game
                    let enemyCar = socket.car;
                    let sentEnemyCar = false;
                   
                    if(car !== enemyCar){
                        if((enemyCar.position.x < maxX && enemyCar.position.x > minX) && (enemyCar.position.y < maxY && enemyCar.position.y > minY)){
                            snapShot.push(enemyCar.name,enemyCar.position.x,enemyCar.position.y, parseFloat(enemyCar.angle.toFixed(3))  ,enemyCar.carIndex + 1); //[...name,x,y,angle,carIndex...]
                            sentEnemyCar = true;
                        }
                    }
                    else{
                        
                        snapShot.push(-1,car.manaCount,car.followerArray.length,Math.trunc(car.position.x),Math.trunc(car.position.y),parseFloat(car.angle.toFixed(3)),car.garageCount ); //[...-1,manaCount,followerLength,X,Y,Angle,garageCount]
                        
                    }

                    enemyCar.followerArray.forEach(function(follower){
                        if((follower.position.x < maxX && follower.position.x > minX) && (follower.position.y < maxY && follower.position.y > minY))
                            if(sentEnemyCar){
                                snapShot.push(follower.id,follower.position.x,follower.position.y,parseFloat(follower.angle.toFixed(3)),(follower.launching) ? 100: 0); //[...id,x,y,angle,isLaunching...]
                            }
                            else{
                                snapShot.push(follower.id,follower.position.x,follower.position.y,parseFloat(follower.angle.toFixed(3)), ((follower.launching) ? 100 : 0) + enemyCar.carIndex + 1);
                            }
                        });

                }
            });

            ///Add Mana
            
            if(!car.spectating)
            game.manaPool.forEach(function (mana){
                if((mana.x < maxX && mana.x > minX) && (mana.y < maxY && mana.y > minY)){
                    let sID = car.socket.id;
                    if(mana.playerTable[sID] === undefined){
                        mana.playerTable[sID] = sID;
                        snapShot.push(-2,mana.id, mana.x, mana.y);
                    }
                    
                }
            });

            car.removeManaArray.forEach(function(rManaID){
                snapShot.push(-2,rManaID, -1,-1);
            });
            car.removeManaArray = [];

            
            return snapShot;
            
        };

        const tick = function(){
            sendUpdates();
        };

        

     

        setInterval(tick.bind(this), 1000 / this.updateRate);
        setInterval(function(){sendLeaderBoard = true;}, 1000 );

    }

   

};