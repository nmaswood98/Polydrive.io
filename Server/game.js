/*jshint esversion: 6 */

global.document = {
    createElement: function () {
        // Canvas
        return {
            getContext: function () {
                return {};
            }
        };
    }
};
global.window = {};


var Matter = require('../Assets/matter.js');
var socketIO = require('socket.io');


var Engine = Matter.Engine,
    Render = Matter.Render,
    Bodies = Matter.Bodies,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Mouse = Matter.Mouse,
    World = Matter.World;


function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

var io;

module.exports.Game = {

    init: function (server) {
        io = socketIO(server);
        this.updateRate = 30;
        this.engine = Engine.create();
        this.engine.world.gravity.y = 0;
        this.world = this.engine.world;
        // this.engine.world.

        this.worldY = 10000;
        this.worldX = 15000;

        World.add(this.world, [
    
            Bodies.rectangle(this.worldX/2, 0, this.worldX, 50, { isStatic: true }),
            Bodies.rectangle(this.worldX/2, this.worldY, this.worldX, 50, { isStatic: true }),
            Bodies.rectangle(this.worldX, this.worldY/2, 50, this.worldY, { isStatic: true }),
            Bodies.rectangle(0, this.worldY/2, 50, this.worldY, { isStatic: true })
        ]);
       
        


        setInterval(this.tick.bind(this), 1000 / 60);
        setInterval(this.tick2.bind(this), 1000 / this.updateRate);
        this.playerJoined();
        this.players = []; 
        this.otherCars = [];
        this.manaPool = [];
        this.sockets = {};

///GameBoardasdfasdfasfdadf


        for(var i = 0;i < 1000;i++){

    var mana =  Matter.Bodies.circle(getRndInteger(0,this.worldX ),getRndInteger(0,this.worldY),20); 
       // var mana =  Matter.Bodies.circle(getRndInteger(0,1000 ),getRndInteger(0,1000),20); 
        mana.isStatic = true;
        mana.isMana = true;
        mana.id = "mana" + i.toString();
        mana.collisionType = 1;
        this.manaPool.push(mana);
        World.add(this.engine.world, mana);

        }



////GameBoard



        io.on("connection", (socket) => {
            // socket.emit("moveCar",socket.id);
            var currentCar = this.playerJoined(socket.id);
            //console.log(socket.id);

            socket.on("disconnect", () => {
                console.log(socket.id + "  DISCONNETC");

                var index = this.players.indexOf(currentCar);
                // console.log(index);

                if (index > -1) {
                    this.players.splice(index, 1);
                    //console.log(socket.id);
                    
                    Matter.Composite.remove(this.world, currentCar);
                    
                    delete this.sockets[currentCar.id];
                }
                //this.sockets[socket.id].disconnect();

            });

            socket.on("respawn", (name) => {
                //player enters 
                console.log("respawn");
                currentCar.playerName = name;
                console.log(currentCar.playerName);
                socket.emit("welcome", { id: currentCar.id, x: currentCar.position.x, y: currentCar.position.y }); /// Sends Client initial information about car. 

                console.log("RWDW");

            });

            socket.kick = () => {
                var index = this.players.indexOf(currentCar);


                if (index > -1) {
                    this.players.splice(index, 1);
                    console.log(currentCar.id + "  CURRENTCar");
                    delete this.sockets[currentCar.id];
                }

                socket.emit("kicked");

            };

            socket.on("ready", (car) => {

                this.sockets[socket.id] = socket;
                this.players.push(currentCar);
                currentCar.speed = 5;
                World.add(this.engine.world, currentCar);
                console.log("ready");


            });

            socket.on("playerTick", (carInfo,launchedCar) => {

                if(launchedCar != null){
                    console.log("Hello");
                    var bodies;
                  var carFound =   Matter.Query.point(currentCar.followerArray, { x:launchedCar.x, y: launchedCar.y });
                  carFound[0].launching = true;
                  carFound[0].launchAngle = Math.atan2((launchedCar.mY - launchedCar.y), (launchedCar.mX - launchedCar.x)) - (Math.PI);
    
                setTimeout(function () { carFound[0].launching = false; }, 5000); //amount of time the car will launch for


                }

                if(currentCar.manaCount == 5){
                    currentCar.manaCount = 0;
                    console.log("NEW CAR ALERT NEW CAR ALERT");
                }


                if (carInfo.stop == false){
                    currentCar.stopped = false;

                    if (currentCar.speed >= 4.8 && currentCar.speed <= 5.1) {
                        currentCar.speed = 5;
                    }
    
                    if (currentCar.speed < 5) { currentCar.speed += 0.2; }
                    else if (carInfo.leftClick === true) {
                        if (currentCar.speed <= 15) {
                        currentCar.speed += 0.35;
    
                        }
    
                    }
                    else if (currentCar.speed > 5) {
                        currentCar.speed = currentCar.speed * 0.96;
    
                    }

                    //console.log(currentCar.speed);
                        this.moveCar(currentCar, carInfo.angle, currentCar.speed);

                    
                }
                else{
                    //this.car.stopped = false; 
                    currentCar.speed = currentCar.speed * 0.95;
                   // this.stopCar(currentCar);
                   this.moveCar(currentCar, carInfo.angle, currentCar.speed);
                }

            });

            socket.on("launch", (mouseInfo) => {


            });
            

        });

        Matter.Events.on(this.engine, 'collisionActive', (event) => { 
           
             var pairs = event.pairs; 
             
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];

                //Doesn't Follow DRY need to fix
                if(pair.bodyA.collisionType == 1  || pair.bodyB.collisionType == 1){
                  //  console.log("HIT MANA");
                    pair.isActive = false;
                    if(pair.bodyA.collisionType == 0){
                        pair.bodyA.parent.manaCount++;
                        var pos = this.manaPool.indexOf(pair.bodyB);
                        Matter.Composite.remove(this.world, pair.bodyB);
                        this.manaPool.splice(pos, 1);
                      //  this.newCarFollower(pair.bodyA.parent.follower);



                    }
                    else if(pair.bodyB.collisionType == 0){
                        pair.bodyB.parent.manaCount++;
                        var pos2 = this.manaPool.indexOf(pair.bodyA);
                        Matter.Composite.remove(this.world, pair.bodyA);
                        this.manaPool.splice(pos2, 1);
                      // this.newCarFollower(pair.bodyB.parent.follower);
                        

                    }
                    
                    
                    
                    break;
                }
                else{

            
                }

                
            

            }
        
        });

        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            var pairs = event.pairs; 
             
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];

              
                

                if(pair.bodyA.isMana || pair.bodyB.isMana){
                    pair.isActive = false;
                    
                    return;
                }
                
                if(pair.bodyA.isStatic || pair.bodyB.isStatic)
                    return;
                  
                if(pair.bodyB.parent.follower == pair.bodyA.parent.follower  && (pair.bodyA.parent.moving && pair.bodyB.parent.moving)){
                    //problem was that the moment it collided it then became another follower so it followed the other rooms
                    pair.isActive = true;
                }
                if (pair.bodyA.parent.id != pair.bodyB.parent.id && (pair.bodyB.parent.follower != pair.bodyA.parent.follower )) {
                  
                    
                    if (pair.bodyA.tag == pair.bodyB.tag) {

                        console.log(pair.bodyA.tag);

                    } else {
                       
                        if (pair.bodyA.tag == 1) { //body A caused the collision
                            //console.log(pair.isActive);
                        
                        
                            this.playerLost(pair.bodyB.parent, pair.bodyA.parent);
                            
                        }
                        else {
   
                            this.playerLost(pair.bodyA.parent, pair.bodyB.parent);
                           

                        }
                    }
                }
            
            
            }

        });




    },
    createCarObject: function (player, carID, car) {
        return { isPlayer: player, ID: carID, x: car.position.x, y: car.position.y, angle: car.angle };

    },

    playerLost: function (carLost, newCar) {

        console.log(carLost.id);
   //     this.otherCars.push(carLost);

        if (carLost.id.substr(-1) != "%") { //followers have % at the end of their id, playercars don't. This identifies if the carLost is the player
            this.sockets[carLost.id].kick();

            carLost.followerArray.forEach((car) => { //sends all car followers from player to the new player.
                if(car != null){
                    this.addCarFollower(newCar.follower, car, true);
                }
            });

        }

        this.addCarFollower(newCar.follower, carLost, true);



    },

    addCarFollower: function (playerCar, carFollower, byCrash) {

        if (byCrash == true) {
            carFollower.moving = false;
            setTimeout(function () { carFollower.moving = true; 


                
            }, 750);

        }

        playerCar.followerArray.push(carFollower);

        var index = carFollower.follower.followerArray.indexOf(carFollower);
        if (index > -1)
            carFollower.follower.followerArray.splice(index,1);

        carFollower.follower = playerCar;
        playerCar.followers++;
        carFollower.id = playerCar.id + "follower" + playerCar.followers + "%";


    },

    clap: function () { console.log("please clap"); },

    playerJoined: function (id) {
        //Position On Board
       // var x = getRndInteger(0,this.worldX), y = getRndInteger(0,this.worldY);
        var x = 200, y = 200;
        //position on board

        
        var width = 118, height = 49, thickness = 3;
        var top = Bodies.rectangle(x - ((width - thickness) / 2 + thickness / 2), y, thickness, height);
        top.collisionType = 0;
        top.tag = 1;
     //   top.isSensor = true;
        top.id = id;
        var bottom = Bodies.rectangle(x, y, width - thickness, height);
        bottom.tag = 0;
        bottom.collisionType = 0;
        bottom.id = id;
        bottom.isSensor = false;
        

        var playerCar = Body.create({
            parts: [top, bottom]
        });


        Matter.Body.setStatic(playerCar, false);
      //  playerCar.isSensor = true;
        playerCar.followers = 0;
        playerCar.manaCount = 0;
        playerCar.collisionType = 0;
        playerCar.follower = playerCar;
        playerCar.id = id; //socket id of clien
        playerCar.followerArray = [];
        playerCar.moving = true;

        return playerCar;
    },

    newCarFollower: function(playerCar){
        var newCar = this.playerJoined(Math.random().toString(36).substring(7)); //Every car needs a random id in order to function properly
        //console.log(newCar.followers);
        World.add(this.engine.world, newCar);
        this.addCarFollower(playerCar,newCar,false);
      
       // newCar.moving = true;
    },


    moveCar: function (car, angle, speed) {

        Matter.Body.setAngle(car, angle);
       
 
        Matter.Body.setVelocity(car, { x: speed * Math.cos(car.angle + Math.PI), y: speed * Math.sin(car.angle + Math.PI) });
       // console.log(car.velocity);
        //console.log(car.position.x);helllo my name is nabhan maswood hello my name is nabhan maswood hell polydrvi.ei polydrive.io polydrive.io polydrvie.i

    },
    stopCar: function (car) {
        Matter.Body.setVelocity(car, { x: 0, y: 0 });
        car.stopped = true;

    },

    sendUpdates: function () {
        //eventuallly only send cars that are visble to the player
        // console.log(this);
        this.players.forEach((car) => {
            var hDis = 2000; var yDis = 1000;
            var maxX = car.position.x + hDis;
            var maxY = car.position.y + yDis;
            var minX = car.position.x - hDis;
            var minY = car.position.y - yDis;

            var sentOtherCars = [];

            var sentUsers = this.players.filter((player)=>{ 
                var inView = false;
                
                
                if( (player.position.x < maxX && player.position.x > minX) &&  (player.position.y < maxY && player.position.y > minY))
                    inView = true;
                else
                    inView = false;
                
            
                
                return inView;       
            
            
            
            
            }).map( (player) => {
                // console.log(player.angle);
                let onPlayer = car === player;
                player.followerArray.forEach((carFollower) => {  
                    sentOtherCars.push({ id: carFollower.id, x: carFollower.position.x, y: carFollower.position.y, 
                                            angle: carFollower.angle, isFollower: (onPlayer) ? true : false,
                                            isLaunching: carFollower.isLaunching
                                        
                                        
                                        });
                });

                if(onPlayer)
                    return { id: player.id, x: player.position.x, y: player.position.y,manaCount: player.mana, angle: player.angle, name: player.playerName };
                else
                    return { id: player.id, x: player.position.x, y: player.position.y, angle: player.angle, name: player.playerName };
            });


           
/*
            this.players.forEach((car1) => {
                car1.followerArray.forEach((carFollower) => {  
                    sentOtherCars.push({ id: carFollower.id, x: carFollower.position.x, y: carFollower.position.y, 
                                            angle: carFollower.angle, isFollower: (car === car1) ? true : false,
                                            isLaunching: carFollower.isLaunching
                                        
                                        
                                        });
                });
            });
*/
            var tempCars = this.otherCars.map(function (player) {

                return { id: player.id, x: player.position.x, y: player.position.y, angle: player.angle };


            });



            sentUsers = sentUsers.concat(sentOtherCars);

            //amount of cars sent to the user




            var sentMana = this.manaPool.filter((player)=>{ 
                var inView = false;
                
                
                if( (player.position.x < maxX && player.position.x > minX) &&  (player.position.y < maxY && player.position.y > minY))
                    inView = true;
                else
                    inView = false;
                
            
                
                return inView;       
            
            
            
            
            }).map(function (mana) {
                return { id: mana.id, x: mana.position.x, y: mana.position.y };




            });


            var word = "";



            
            //var d = new Date();
            this.sockets[car.id].emit("draw", sentUsers, sentMana,Date.now());
            
            //console.log(d.getSeconds());


        });


    },

    moveCars: function () {


        this.players.forEach((car) => {
            car.followerArray.forEach((carFollower) => {
              

                if(carFollower.launching){
                    
                    this.moveCar(carFollower,carFollower.launchAngle,20);
                }
                else if (carFollower.moving && !carFollower.follower.stopped) {
                    var angle = Math.atan2((car.position.y - carFollower.position.y), (car.position.x - carFollower.position.x)) - (Math.PI);
                //    console.log(carFollower.position);
                    this.moveCar(carFollower, angle, 4);
                }

            });
        });


    },




    tick: function () {
        this.moveCars();
        Engine.update(this.engine, 1000 / 60);
        
        
     ///   



    },

    tick2: function () {
        this.sendUpdates();

    }

};

 