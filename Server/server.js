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
        this.updateRate = 20;
        var primus = new Primus(server, {port: 3000, transformer: 'websockets',parser: 'JSON',pingInterval:0}); //Need To Change to uws
        var game = Object.create(Game);
        game.init(primus);

        
        primus.on('connection', function (socket) {
            socket.inGame = false; 
            socket.spectating = false;
            socket.car = null;
            console.log("Client Connected");
            
            sendUpdates();
            socket.on('data', function (data) {///data should always be an array
                switch(data[0]) {
                    case "spawn": ///might need to wait until recieved cilent movement to add into the world // ["spawn"]
                        
                        socket.car = Car.create(socket.id,true, {x:(getRndInteger(0,game.worldX)),y:(getRndInteger(0,game.worldY))},game.system);
                        socket.car.followerArray = [];
                        socket.car.removeManaArray = [];
                        socket.car.socket = socket; 
                        socket.car.name = data[1];
                        socket.car.carIndex = data[2];

                        socket.write([1,socket.car.position.x,socket.car.position.y]); //Replace with actual Welcome Message
                        socket.inGame = true;
                        socket.car.speed = 5;
                        socket.car.rClick = false;
                        game.players.push(socket.car);
                        

                        socket.inGame = true;
                        break;
                    case "playerTick": //["playerTick",angle,stopped,leftClick,rightClick,launchedCar]
                        let carInfo = data[1];

                        if(socket.inGame){
                            if(data[5] != null){
                                var carFound = socket.car.followerArray.find(c => c.id === launchedCar.id);
                                if(carFound != undefined){
                                    carFound.launching = true;
                                    carFound.launchAngle = Math.atan2((launchedCar.mY - launchedCar.y), (launchedCar.mX - launchedCar.x)) - (Math.PI);
                                    setTimeout(function () { carFound.launching = false; }, 1000); //amount of time the car will launch for
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
                    case "newC": //["newC"]
                        break;
                    default:
                        console.log("ERROR: Client sent packet unrecognized by server");
                }

            });

            socket.kick = (followerCount) =>{
                var index = game.players.indexOf(socket.car);
                if (index > -1) {
                    
                    //Creates object containg information from the dead player in order to continue sending updates to client that is spectating. 
                    game.players.splice(index, 1);
                    socket.car =  {spectating:true, position: {x:socket.car.position.x, y:socket.car.position.y},id: socket.id, followerCountAtDeath:followerCount, removeManaArray:socket.car.removeManaArray}; 
                
                    socket.inGame = false;
                    socket.spectating = true;
                  
                }
                else{
                    console.log("ERROR at 135, THIS SHOULDN'T RUN");
                }
                socket.write("KICKED"); ///update in lcinet
                //socket.car = null;
                setTimeout( () => {  socket.spectating = false;
                    socket.car = null;
                }, 5000);

            };
    
        });

        primus.on('disconnection', function (socket) {
           //disconnect code
           console.log("Disconnecting Socket0");
           if(socket.inGame){
           var index = game.players.indexOf(socket.car);

           if (index > -1) {
            game.players.splice(index, 1);
            socket.car.followerArray.forEach(elem => {
                elem.cBody.remove();
            });
            socket.car.cBody.remove(); //removes body from collision system
        }
        }

        });

        const sendUpdates = ()=>{
            //Add LeaderBoard write;

            primus.forEach(function (socket, id, connections) {//socket.car contains the car information, socket.car.followerArray etc
              if(socket.inGame || socket.spectating ){
                var d = new Date();
                let snapShot = createSnapShot(socket.car);
                snapShot.push(Date.now());

                socket.write(snapShot);
              }
              });

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
                   
                    if(car !== enemyCar){
                        if((enemyCar.position.x < maxX && enemyCar.position.x > minX) && (enemyCar.position.y < maxY && enemyCar.position.y > minY))
                            snapShot.push(enemyCar.name,enemyCar.position.x,enemyCar.position.y, parseFloat(enemyCar.angle.toFixed(3))  ,enemyCar.carIndex); //[...name,x,y,angle,carIndex...]
                            //need to send carIndex
                    }
                    else{
                        
                        snapShot.push(-1,car.manaCount,car.followerArray.length,Math.trunc(car.position.x),Math.trunc(car.position.y),parseFloat(car.angle.toFixed(3)) ); //[...-1,manaCount,followerLength,X,Y,Angle]
                        
                    }

                    enemyCar.followerArray.forEach(function(follower){
                        if((follower.position.x < maxX && follower.position.x > minX) && (follower.position.y < maxY && follower.position.y > minY))
                            snapShot.push(follower.id,follower.position.x,follower.position.y,parseFloat(follower.angle.toFixed(3)),follower.isLaunching); //[...id,x,y,angle,isLaunching...]
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
                console.log("PIOWJAIODJWPOIJ");
                snapShot.push(-2,rManaID, -1,-1);
            });
            car.removeManaArray = [];

            
            return snapShot;
            
        };

        const tick = function(){
            sendUpdates();
        };

        setInterval(tick.bind(this), 1000 / this.updateRate);

    }

   

};