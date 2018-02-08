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


var io;

module.exports.Game = {

    init: function (server) {
        io = socketIO(server);

        this.engine = Engine.create();
        this.engine.world.gravity.y = 0;
        this.world = this.engine.world;
        // this.engine.world.

        setInterval(this.tick.bind(this), 1000 / 60);
        this.playerJoined();
        this.players = [];
        this.otherCars = [];
        this.sockets = {};
        var gameServer = this;

        io.on("connection", function (socket) {
            // socket.emit("moveCar",socket.id);
            var currentCar = gameServer.playerJoined(socket.id);
            //console.log(socket.id);

            socket.on("disconnect", function () {
                console.log(socket.id + "  DISCONNETC");

                var index = gameServer.players.indexOf(currentCar);
                // console.log(index);

                if (index > -1) {
                    gameServer.players.splice(index, 1);
                    //console.log(socket.id);
                    delete gameServer.sockets[currentCar.id];
                }
                //gameServer.sockets[socket.id].disconnect();

            });

            socket.on("respawn", function () {
                //player enters 
                console.log("respawn");

                socket.emit("welcome", { id: currentCar.id, x: currentCar.position.x, y: currentCar.position.y }); /// Sends Client initial information about car. 

                console.log("RWDW");

            });

            socket.kick = function () {
                var index = gameServer.players.indexOf(currentCar);


                if (index > -1) {
                    gameServer.players.splice(index, 1);
                    console.log(currentCar.id + "  CURRENTCar");
                    delete gameServer.sockets[currentCar.id];
                }

                socket.emit("kicked");

            };

            socket.on("ready", function (car) {

                gameServer.sockets[socket.id] = socket;
                gameServer.players.push(currentCar);
                World.add(gameServer.engine.world, currentCar);
                console.log("ready");


            });

            socket.on("playerTick", function (carInfo) {


                if (carInfo.stop == false)
                    gameServer.moveCar(currentCar, carInfo.angle, 5);
                else
                    gameServer.stopCar(currentCar);

            });




        });

        Matter.Events.on(this.engine, 'collisionActive', function (event) { 
             var pairs = event.pairs; 
             
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
               
                if (pair.bodyA.parent.id != pair.bodyB.parent.id && (pair.bodyB.parent.follower != pair.bodyA.parent.follower)) {
                  
                    
                    if (pair.bodyA.tag == pair.bodyB.tag) {

                        console.log(pair.bodyA.tag);

                    } else {
                       
                        if (pair.bodyA.tag == 1) { //body A caused the collision
                            //console.log(pair.isActive);
                        
                          console.log(pair.bodyA.isSensor);
                            gameServer.playerLost(pair.bodyB.parent, pair.bodyA.parent);
                            
                        }
                        else {
                            console.log(pair.bodyA.isSensor);
   
                            gameServer.playerLost(pair.bodyA.parent, pair.bodyB.parent);
                           

                        }
                    }

                }

            }
        
        });

        Matter.Events.on(this.engine, 'collisionStart', function (event) {
            var pairs = event.pairs; 
             
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                pair.bodyB.parent.goInto ();
                pair.bodyA.parent.goInto ();
                console.log(pair.bodyA.isSensor);
                console.log(pair.bodyB.isSensor);

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

        }

        this.addCarFollower(newCar.follower, carLost, true);



    },

    addCarFollower: function (playerCar, carFollower, byCrash) {

        if (byCrash == true) {
            carFollower.moving = false;
            setTimeout(function () { carFollower.moving = true; }, 500);

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
        var x = 200, y = 200, width = 60, height = 30, thickness = 3;
        var top = Bodies.rectangle(x - ((width - thickness) / 2 + thickness / 2), y, thickness, height);
        top.tag = 1;
     //   top.isSensor = true;
        top.id = id;
        var bottom = Bodies.rectangle(x, y, width - thickness, height);
        bottom.tag = 0;
        bottom.id = id;
        bottom.isSensor = false;
        

        var playerCar = Body.create({
            parts: [top, bottom]
        });


        Matter.Body.setStatic(playerCar, false);
      //  playerCar.isSensor = true;
        playerCar.followers = 0;
        playerCar.follower = playerCar;
        playerCar.id = id; //socket id of clien
        playerCar.followerArray = [];

        playerCar.goInto = function(){
            bottom.isSensor = true;
           // top.isSensor = true;

        };

        console.log("What Up pimps");

        return playerCar;
    },




    moveCar: function (car, angle, speed) {

        Matter.Body.setAngle(car, angle);



        Matter.Body.setVelocity(car, { x: speed * Math.cos(car.angle + Math.PI), y: speed * Math.sin(car.angle + Math.PI) });

        //console.log(car.position.x);

    },
    stopCar: function (car) {
        Matter.Body.setVelocity(car, { x: 0, y: 0 });

    },

    sendUpdates: function () {
        //eventuallly only send cars that are visble to the player
        // console.log(this);

        var sentUsers = this.players.map(function (player) {

            return { id: player.id, x: player.position.x, y: player.position.y, angle: player.angle };

        });


        var sentOtherCars = [];

        this.players.forEach(function (car) {
            car.followerArray.forEach(function (carFollower) {

                sentOtherCars.push({ id: carFollower.id, x: carFollower.position.x, y: carFollower.position.y, angle: carFollower.angle });

            }.bind(this));
        }.bind(this));

        var tempCars = this.otherCars.map(function (player){

            return { id: player.id, x: player.position.x, y: player.position.y, angle: player.angle };


        });



        sentUsers = sentUsers.concat(sentOtherCars);
        
        //amount of cars sent to the user
        //console.log(sentUsers.length);


        var word = "";
        this.players.forEach(function (car) {
            //    console.log(this.players.length);


            this.sockets[car.id].emit("draw", sentUsers);



        }.bind(this));


    },

    moveCars: function () {


        this.players.forEach(function (car) {
            car.followerArray.forEach(function (carFollower) {

                if (carFollower.moving) {
                    var angle = Math.atan2((car.position.y - carFollower.position.y), (car.position.x - carFollower.position.x)) - (Math.PI);
                    //   console.log(car.id);


                    
                    this.moveCar(carFollower, angle, 4);
                }

            }.bind(this));
        }.bind(this));


    },




    tick: function () {
        this.moveCars();
        Engine.update(this.engine, 1000 / 60);
        
        this.sendUpdates();
     ///   



    },

    tick2: function () {


    }









};

