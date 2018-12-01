/*jshint esversion: 6 */


var Collisions = require('detect-collisions').Collisions;

var Car = require('./WorldItems.js').WorldItems.Car;
var Vector = require('./WorldItems.js').WorldItems.Vector;

var socketIO = require('socket.io');



function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

var io;

module.exports.Game = {

    init: function (primus) { //Initilizes the game world and the socket connections. Need to refactor code to remove socket connection and process elsewhere
     this.primus = primus;

        this.worldSizeType = 0;
        this.worldX = 2500;
        this.worldY = 2500;
        this.carLimit = 100;

        this.resizeGame = (size) =>{
            switch(size) {
                case 0:
                    this.worldX = 2500;
                    this.worldY = 2500;
                    break;
                case 1:
                    this.worldX = 7500;
                    this.worldY = 5000;
                    break;
                case 2: 
                    this.worldX = 10000;
                    this.worldY = 7500;
                    break;
                case 3:
                    this.worldX = 15000;
                    this.worldY = 10000;
                    break; 
                default:
                    this.worldX = 2500;
                    this.worldY = 2500;
            }

            this.worldSizeType = size;
        };

        this.resizeGame(1);
             
        this.system = new Collisions();
        this.result = this.system.createResult();

        
    
        var lastUpdate = Date.now();
        setInterval(this.tick.bind(this), 1000 / 60);
        
    
        //Everything in these arrays are sent to the clients to be drawned in the world. 
        this.players = []; //Players
        this.spectating = []; //Spectators 
        this.miscObjects = []; //Objects
        this.manaPool = []; //Mana
        this.manaRemoved = [];
        //

        this.sockets = {}; // Stores the sockets to the players in the game

///GameBoardasdfasdfasfdadf
        
        this.addMana = () =>{ //Fix for new system
            var mana = this.system.createCircle(getRndInteger(0,this.worldX ), getRndInteger(0,this.worldY), 20);
            mana.inGame = true;
            mana.playerTable = {};

            if(this.manaRemoved.length === 0){
                mana.id = (this.manaPool.length + 1); 
            }
            else{
                mana.id = this.manaRemoved.pop();
            }

            this.manaPool.push(mana);

        };


        for(var i = 0;i < 500;i++){
            this.addMana();
   

        }



////GameBoard

///Need to seperate WEb Socket logic from game logic. 

    },
    createCarObject: function (player, carID, car) {
        return { isPlayer: player, ID: carID, x: car.position.x, y: car.position.y, angle: car.angle };

    },

    deleteCarFollower: function(car){


    },

    shouldAddCar: function(player){
        let carCount = player.followerArray.length + player.garageCount;
        let barrierToPass = 10000;

        if(carCount <= 10){
            barrierToPass = (60 * carCount) + 40;
        }
        else if (carCount <= 15){
            barrierToPass = (90 * carCount) + 40;
        }

        if((player.manaCount >= barrierToPass) && (carCount <= 50))
            return true;
        
        return false;
    },

    playerLost: function (carLost, newCar) { // BUG IS HERE
        /* newCar hit carLost. If carLost is a player then we should kick them from the game while transfering all cars the player had to the new player
            If carLost is just an enemy car then we should just call addCarFollower which will result in carLost tranfering ownership to newCar */
  
        newCar.follower.manaCount += 10;
        if (carLost.follower.id === carLost.id) {
             //followers have % at the end of their id, playercars don't. This identifies if the carLost is the players
            
            var followerCountAtDeath = carLost.followerArray.length;
            carLost.followerArray.forEach((car) => { //sends all car followers from player to the new player.
                
                newCar.manaCount += 10;
                if(car != null){
                    this.addCarFollower(newCar.follower, car,false, true);
                }
            });
            carLost.followerArray = []; ///////THis is required for some reason. 
            newCar.follower.garageCount += carLost.garageCount;
            
            carLost.socket.kick(followerCountAtDeath);
            this.addCarFollower(newCar.follower, carLost,false, true);
        }
        else{
            let carLostFollower = carLost.follower;
            this.addCarFollower(newCar.follower, carLost,true, true);

            carLostFollower.addFromGarage();

        }

        
            
            

            



    },

    addCarFollower: function (playerCar, carFollower,shouldRemove, byCrash) {
        /* Takes carFollower and makes it follow playerCar. If shouldRemove is true then carFollower is part currently following another car 
            so we should change which car owns the carFollower i.e following it. If the amount of cars following playerCar === the car limit
            then we should not make carFollower follow playerCar instead remove it from the game. */

        if (byCrash == true) { /// BUG IS HERE
            carFollower.moving = false;
            setTimeout(function () { carFollower.moving = true; 
            }, 750);

        }
        //Changing Car Follower
        //

        if(shouldRemove){
            
            var index = carFollower.follower.followerArray.indexOf(carFollower);
            if (index > -1){
                carFollower.follower.followerArray.splice(index,1);
            }
            else
                console.log("ERROR at line 377");
        }

        if(playerCar.followerArray.length < this.carLimit){
            playerCar.followerArray.push(carFollower);
            playerCar.followers++;
            carFollower.follower = playerCar;
            carFollower.changeID(getRndInteger(1, 500));
        
        }
        else {
            carFollower.cBody.remove();
            playerCar.garageCount++;
        }

       
        


    },


    newCarFollower: function(playerCar){ //Creates a new car and adds to the playerCar follower pool
        if(playerCar.followerArray.length < this.carLimit){
        var carLoc = Vector.rotate({x:150,y:0}, playerCar.angle);
        var newCar = Car.create(getRndInteger(1, 500),false,{x: playerCar.position.x + carLoc.x,y:playerCar.position.y + carLoc.y},this.system);
        this.addCarFollower(playerCar,newCar,false);
        }
        else{
            playerCar.garageCount++;
        }
    },


    moveCar: function (dt,car, angle, speed) { //Moves the cars. IF Follower moves it according to boids algorithm 
        
       car.angle = angle;
        
        if(car.follower === car){
            car.velocity = { x: speed * Math.cos(car.angle + Math.PI) * dt , y: speed * Math.sin(car.angle + Math.PI) * dt };
            
            car.translate(car.velocity);
            return;
        }

        if(car.launching){
            car.velocity = {x:0,y:0};
            car.velocity = { x: speed * Math.cos(car.angle + Math.PI) * dt, y: speed * Math.sin(car.angle + Math.PI) * dt };
            car.translate(car.velocity);
            return;
        }

        var movementSpeed = speed * dt;
        if(!(car === car.follower) && !(car.launching)){
        if(car.follower.rClick)
            movementSpeed = speed * dt;
        else if(car.follower.lClick && car.follower.stopped)
            movementSpeed = 20 * dt;
        else
            movementSpeed = car.follower.speed * dt;
            
       
        }

 
        function avoidDir(car1,speed){
            let potentials = car1.cBody.potentials();
            var steer = {x:0,y:0};
            var count = 0;
           // console.log(potentials.length);
            potentials.forEach(element1 => {
                if(element1.par != undefined){
                var element = element1.par;
                 var d = Vector.magnitude(Vector.sub(car1.position,element.position));
                if(element != car1){
                 if((d > 0)&&(d < (1000))){
                     
                    var diff = Vector.sub(car1.position,element.position);
                    diff = Vector.normalise(diff);
                    diff = Vector.div(diff, d);
                    steer = Vector.add(steer,diff);
                    count++;

                 }
                }
                else{
                    d = Vector.magnitude(Vector.sub(car1.position,car1.follower.position));
                    if((d >= 0)&&(d < (200))){
                        
                    var diff = Vector.sub(car1.position,car1.follower.position);
                    
                    diff = Vector.normalise(diff);
                    diff = Vector.div(diff, d);
                    steer = Vector.add(steer,diff);
                    count++;
                    }
                }
            }

            });

            if(count > 0){
                steer = Vector.div(steer,count);
                steer = Vector.normalise(steer);
                steer = Vector.mult(steer,speed);
                steer = Vector.sub(steer,car1.velocity);

                if(Vector.magnitude(steer) >5)
                    steer = Vector.mult(Vector.normalise(steer),5);

            }

            return steer;

        }

      

  

        function tend_to_place(car1,speed){
            var place = Vector.sub(car1.follower.position,car1.position);

            place = Vector.normalise(place);
            place = Vector.mult(place,speed);

            var steer = Vector.sub(place,car1.velocity);
            if(Vector.magnitude(steer) >2)
                steer = Vector.mult(Vector.normalise(steer),2);
            return steer;
        }
        
        var zero = {x:0,y:0};
        var s = avoidDir(car,movementSpeed);
        
        var t = tend_to_place(car,movementSpeed);
        var cc = car.velocity;
      // var v = zero;
        var v = {x:(cc.x + s.x +  t.x ),y:(cc.y +s.y +  t.y)};
       // v = Vector.normalise(v);
        

        car.velocity = v;
        car.translate(v);
            
          

    },
  



    moveCars: function (dt) { //calls moveCar on all cars with the appropiate direction and speed 

        this.players.forEach((car) => {
          // console.log( car.followerArray.length);
          if(car.spectating)
            return;
            
            car.followerArray.forEach((carFollower) => {
               

                if(carFollower.launching){
                    
                    this.moveCar(dt,carFollower,carFollower.launchAngle,30);
                }
                else {
                    
                    var angle = Math.atan2((car.position.y - carFollower.position.y), (car.position.x - carFollower.position.x)) - (Math.PI);
                //    console.log(carFollower.position);
                    this.moveCar(dt,carFollower, angle, 4);
                }

            });


        });


    },

    tick: function () {
        var now = Date.now();
        var dt = (now - this.lastUpdate)/1000;
        this.lastUpdate = now;
        this.moveCars(dt*50);
        this.system.update();
        this.processCollisions();

     ///   
    },

    processCollisions: function (){ //CHecks for collisions between the cars. Need to improve double checking. 
        
        this.players.forEach(player => {
            let potentials = player.cBody.potentials();
            potentials.forEach(body => { //Player is a Car object while body is just a collision body. body.par gives you the Car object 

                if(body.par === undefined){ //Is Mana
                    //handle mana collision
                   
                    for (var playerID in body.playerTable) {
                        var socket = this.primus.spark(playerID);
                    if(socket !== undefined){
                        if(socket.car !== null)
                            socket.car.removeManaArray.push(body.id);
                    }
                   }

                    this.manaRemoved.push(body.id);
                    body.remove();
                    player.manaCount++;
                   
                    var manaIndex = this.manaPool.indexOf(body);
                    this.manaPool.splice(manaIndex, 1);
                    this.addMana();

                    if(this.shouldAddCar(player)){    
                            this.newCarFollower(player);
                    }



                }
                else if(player.follower.id != body.par.follower.id){ //Enemy Car Collision

                    if(player.cBody.head.collides(body,this.result)) {
                        if(player.cBody.head.collides(body.head)){
                            console.log("ERROR");
                        }else{

                            if(player.speed >= body.par.speed)
                                this.playerLost(body.par,player);
                            
                        }
                        player.translate({x:-(this.result.overlap * this.result.overlap_x),y:-(this.result.overlap * this.result.overlap_y)});

                    }

                }

            });

            if(player.position.x > this.worldX + 100 || player.position.y > this.worldY + 100 || player.position.x < -100 || player.position.y < -100){
                if(player.timeOutside === null)
                {
                    player.timeOutside = Date.now();
                }
                else if ((Date.now() - player.timeOutside) >= 2500){
                    player.socket.kick(player.followerArray.length);
                    return;
                }
                
            }
            else{
                player.timeOutside = null;
            }

        player.followerArray.forEach(childCar => {
           
            //CHecks all the car Followers. 
            potentials = childCar.cBody.potentials();
            potentials.forEach(body => {
                if(body.par === undefined){ //Is Mana
                    //handle mana collision
                    childCar.hitCar = true;
                    
                    for (var playerID in body.playerTable) {
                        var socket = this.primus.spark(playerID);
                        if(socket !== undefined){
                            if(socket.car !== null)
                                socket.car.removeManaArray.push(body.id);
                        }
                    }

                    this.manaRemoved.push(body.id);
                    body.remove();
                    
                    player.manaCount++;
                    var manaIndex = this.manaPool.indexOf(body);
                    this.manaPool.splice(manaIndex, 1);
                    this.addMana();

                    if(this.shouldAddCar(player)){    
                            this.newCarFollower(player);
                    }

                }
                else if(childCar.follower.id != body.par.follower.id){ //Enemy Car Collision


                    if(childCar.cBody.head.collides(body,this.result)) {
                        if(childCar.cBody.head.collides(body.head)){
                                console.log("ERROR");
                        }else{

                            
                                this.playerLost(body.par,player);
                               
                        }
                        childCar.translate({x:-(this.result.overlap * this.result.overlap_x),y:-(this.result.overlap * this.result.overlap_y)});

                    }



                }

        });

    
    });

     
        });

        

    },

    tick2: function () {
        this.sendUpdates();

    }

};
