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
        this.updateRate = 20;
        this.engine = Engine.create();
        this.engine.world.gravity.y = 0;
        this.world = this.engine.world;
        // this.engine.world.

        //this.engine.enableSleeping = true;

        this.worldY = 5000;
        this.worldX = 7500;

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
        this.spectating = [];
        this.otherCars = [];
        this.manaPool = [];
        this.sockets = {};

///GameBoardasdfasdfasfdadf

        this.addMana = () =>{

            var mana =  Matter.Bodies.circle(getRndInteger(0,this.worldX/4 ),getRndInteger(0,this.worldY/4),20); 
            // var mana =  Matter.Bodies.circle(getRndInteger(0,1000 ),getRndInteger(0,1000),20); 
             mana.isStatic = true;
             mana.isMana = true;
             mana.id = "mana" + i.toString();
             mana.collisionType = 1;
             this.manaPool.push(mana);
             World.add(this.engine.world, mana);
        };


        for(var i = 0;i < 500;i++){
            this.addMana();
   

        }



////GameBoard



        io.on("connection", (socket) => {
            // socket.emit("moveCar",socket.id);
            var currentCar = null;
            //console.log(socket.id);

            socket.on("disconnect", () => {
                console.log(socket.id + "  DISCONNETC");

                var index = this.players.indexOf(currentCar);
                // console.log(index);

                if (index > -1) {
                    this.players.splice(index, 1);
                    //console.log(socket.id);

                    currentCar.followerArray.forEach(elem => {
                        Matter.Composite.remove(this.world, elem);
                    });
                    
                    Matter.Composite.remove(this.world, currentCar);
                    
                    delete this.sockets[currentCar.id];
                }
                //this.sockets[socket.id].disconnect();

            });

          

            socket.on("spawn",(name,cI) =>{
                currentCar = this.playerJoined(socket.id);
                currentCar.playerName = name;
                currentCar.carIndex = cI;
                socket.emit("welcome", { id: currentCar.id, x: currentCar.position.x, y: currentCar.position.y });


            });

            socket.kick = () => {
                var index = this.players.indexOf(currentCar);
                
                var tempId = currentCar.id;
                if (index > -1) {
                    this.spectating.push({spectating:true, x:currentCar.position.x, y:currentCar.position.y,id: socket.id}); 
                    var sIndex = this.spectating.length - 1;
                    this.players.splice(index, 1);
                  this.sockets[currentCar.id].inGame = false;
                }
                else{
                    console.log("ERROR at 135, THIS SHOULDN'T RUN");
                }

                socket.emit("kicked");
                
                currentCar = null;
                setTimeout( () => {  this.spectating.splice(sIndex, 1);
                      }, 5000);

            };

            

            socket.on("ready", (car) => {

                this.sockets[socket.id] = socket;
                this.players.push(currentCar);
                currentCar.speed = 5;
                currentCar.rClick = false;
                World.add(this.engine.world, currentCar);
                socket.inGame = true;
                for(var e = 0; e < 100; e++){
                    this.newCarFollower(currentCar);
                }
                console.log("ready");


            });

            socket.on("playerTick", (carInfo,launchedCar) => {
                if(socket.inGame){
                if(launchedCar != null){
                    console.log("Hello");
                    var bodies;
                  //var carFound =   Matter.Query.point(currentCar.followerArray, { x:launchedCar.x, y: launchedCar.y });
                    var carFound = currentCar.followerArray.find(c => c.id === launchedCar.id);
                  
                if(carFound != undefined){
                  carFound.launching = true;
                  carFound.launchAngle = Math.atan2((launchedCar.mY - launchedCar.y), (launchedCar.mX - launchedCar.x)) - (Math.PI);
                  setTimeout(function () { carFound.launching = false; }, 1000); //amount of time the car will launch for
                }
                else{
                    console.log("ERROR: CLIENT SENT NONEXISTANT ID");
                }

                }

                if(currentCar.manaCount == 5){
                   // currentCar.manaCount = 0;
                   // console.log("NEW CAR ALERT NEW CAR ALERT");
                }


                if (carInfo.stop == false){
                    currentCar.stopped = false;

                    if (currentCar.speed >= 4.8 && currentCar.speed <= 5.1) {
                        currentCar.speed = 5;
                    }
                    currentCar.rClick = carInfo.rightClick;
                    currentCar.lClick = carInfo.leftClick;
                    if (currentCar.speed < 5) { currentCar.speed += 0.2; }
                    else if (carInfo.leftClick === true || carInfo.rightClick === true) {
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
                   currentCar.stopped = true;
                   this.moveCar(currentCar, carInfo.angle, currentCar.speed);
                }
            }
            });

            socket.on("launch", (mouseInfo) => {


            });
            

        });
        this.engine.cc = 0;
        Matter.Events.on(this.engine, 'collisionActive', (event) => { 
           
             var pairs = event.pairs; 
             
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];

                //Doesn't Follow DRY need to fix
                if(pair.bodyA.collisionType == 1  || pair.bodyB.collisionType == 1){
                  //  console.log("HIT MANA");
                    pair.isActive = false;
                    if(pair.bodyA.collisionType == 0 ){
                        var pCar = pair.bodyA.parent.follower; //The car of the player
                        pCar.manaCount++;
                        
                        this.engine.cc++;
                        var pos = this.manaPool.indexOf(pair.bodyB);
                        Matter.Composite.remove(this.world, pair.bodyB);
                        this.manaPool.splice(pos, 1);
                       // if( (pCar.manaCount % ( (pCar.followerArray.length * 10) + 10) ) === 0 )
                          //  this.newCarFollower(pCar);



                    }
                    else if(pair.bodyB.collisionType == 0 ){
                        var pCar = pair.bodyB.parent.follower; //The car of the player
                        pCar.manaCount++;
                        
                        var pos2 = this.manaPool.indexOf(pair.bodyA);
                        Matter.Composite.remove(this.world, pair.bodyA);
                        this.manaPool.splice(pos2, 1);
                      //  if( (pCar.manaCount % ( (pCar.followerArray.length + 1) * 10) ) === 0)
                         //   this.newCarFollower(pCar);
                        

                    }
                   // this.addMana();
                    
                    
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
                  //console.log("POOPPOOPO");






                    
                    if (pair.bodyA.tag == pair.bodyB.tag) {
                        
                       // console.log(pair.bodyA.tag + " HEYO ");

                    } else {
                        
                        if (pair.bodyA.tag == 1) { //body A caused the collision
                            //console.log(pair.isActive);
                          //  console.log("AAAA");
                          //  if(pair.bodyB.parent.removed === false){
                             //   pair.bodyB.parent.removed = true;
                                this.playerLost(pair.bodyB.parent, pair.bodyA.parent);
                           // }
                            
                        }
                        else {
                            //console.log("BBBB");
                         //   if(pair.bodyA.parent.removed === false){
                             //   pair.bodyA.parent.removed = true;
                                this.playerLost(pair.bodyA.parent, pair.bodyB.parent);
                          //  }
                           

                        }
                    }











                }
            
            
            }

        });




    },
    createCarObject: function (player, carID, car) {
        return { isPlayer: player, ID: carID, x: car.position.x, y: car.position.y, angle: car.angle };

    },

    playerLost: function (carLost, newCar) { // BUG IS HERE

        //console.log(carLost.id);
   //     this.otherCars.push(carLost);
        newCar.manaCount += 10;
        if (this.sockets.hasOwnProperty(carLost.id)) {
             //followers have % at the end of their id, playercars don't. This identifies if the carLost is the players
            console.log(carLost.followerArray.length);
            carLost.followerArray.forEach((car) => { //sends all car followers from player to the new player.
                
                newCar.manaCount += 10;
                if(car != null){
                    this.addCarFollower(newCar.follower, car,false, true);
                }
            });
            carLost.followerArray = [];
            this.sockets[carLost.id].kick();
        }
            
            this.addCarFollower(newCar.follower, carLost,true, true);



    },

    addCarFollower: function (playerCar, carFollower,shouldRemove, byCrash) {
        
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

            playerCar.followerArray.push(carFollower);
            playerCar.followers++;
            carFollower.follower = playerCar;
            carFollower.changeID(Math.random().toString(36).substring(7));
        
        
        


    },

    clap: function () { console.log("please clap"); },

    playerJoined: function (id,x1,y1) {
        //Position On Board
       // var x = getRndInteger(0,this.worldX), y = getRndInteger(0,this.worldY);
       if(x1 == undefined)
       var x = getRndInteger(0,this.worldX), y = getRndInteger(0,this.worldY);
        else{
            x = x1;
            y = y1;
        }
        //position on board

        
        var width = 149, height = 70, thickness = 10;
        var top = Bodies.rectangle(x - ((width - thickness) / 2 + thickness / 2), y, thickness, height);
        top.collisionType = 0;
        top.tag = 1;
     //   top.isSensor = true;
        top.isStatic = true;
        top.id = id;
        var bottom = Bodies.rectangle(x, y, width - thickness, height);
        bottom.tag = 0;
        bottom.collisionType = 0;
        bottom.id = id;
        bottom.isSensor = false;
        bottom.isStatic = true;

        var playerCar = Body.create({
            parts: [top, bottom]
        });


        Matter.Body.setStatic(playerCar, false);
      //  playerCar.isSensor = true;
        playerCar.followers = 0;
        playerCar.manaCount = 0;
        playerCar.carMeter = 0;
        playerCar.collisionType = 0;
        playerCar.follower = playerCar;
        playerCar.id = id; //socket id of clien
    playerCar.isStatic = true;
        playerCar.changeID= function(i){playerCar.id = i; top.id = "top" + i; bottom.id = "bot" + i;};
        playerCar.followerArray = [];
        playerCar.moving = true;
        playerCar.removed = false;
        playerCar.spectating = false;
        Matter.Body.setVelocity(playerCar,{x:0,y:0});

      

        return playerCar;
    },

    newCarFollower: function(playerCar){
        //console.log(playerCar.);
        var carLoc = Matter.Vector.rotate({x:150,y:0}, playerCar.angle);
        var newCar = this.playerJoined(Math.random().toString(36).substring(7),playerCar.position.x + carLoc.x,playerCar.position.y + carLoc.y); //Every car needs a random id in order to function properly
        
        console.log("heheh");
        World.add(this.engine.world, newCar);
        this.addCarFollower(playerCar,newCar,false);
      
       // newCar.moving = true;
    },


    moveCar: function (car, angle, speed) {
        Matter.Body.setAngle(car, angle);
        if(car.follower === car){
            Matter.Body.translate(car, { x: speed * Math.cos(car.angle + Math.PI), y: speed * Math.sin(car.angle + Math.PI) });
            return;
        }

        function rule1(car1){
            var pcj = {x:0,y:0};
            car1.follower.followerArray.forEach(vehicle => {
                if(car1 != vehicle)
                    pcj = Matter.Vector.add(pcj,vehicle.position);


            });
            pcj = Matter.Vector.div(pcj,car1.follower.followerArray.length-1);
            return Matter.Vector.div(Matter.Vector.sub(pcj,car1.position),100) ;

        }

        function rule2(car1){
            var c = {x:0,y:0};
            car1.follower.followerArray.forEach(vehicle => {
                if(car1 != vehicle) 
                    if (Matter.Vector.magnitude(Matter.Vector.sub(car1.position,vehicle.position)) < 100)
                        c = Matter.Vector.sub(c,Matter.Vector.sub(vehicle.position,car1.position));
                    
            });
            return  Matter.Vector.div(c,1);        
        }

        function rule3(car1){
            var pvj = {x:0,y:0};
            car1.follower.followerArray.forEach(vehicle => {
                if(car1 != vehicle)
                   pvj = Matter.Vector.add(pvj,vehicle.velocity);
                    
                    
            });
            pvj = Matter.Vector.div(pvj,car1.follower.followerArray.length - 1);
            return Matter.Vector.div(Matter.Vector.sub(pvj,car1.velocity),8);        
        }

        function tend_to_place(car1){
            var place = car1.follower.position;

            return Matter.Vector.div(Matter.Vector.sub(place,car1.position),100);
        }

        function limit_velocity(car1){

            
        }

        

        

        var movementSpeed = speed;
        if(!(car === car.follower) && !(car.launching)){
        if(car.follower.rClick)
            movementSpeed = speed;
        else 
            movementSpeed = car.follower.speed;
            
        
       
        }
        var zero = {x:0,y:0};
       // var v = rule1(car)+rule2(car)+rule3(car) + tend_to_place(car);
        var v = Matter.Vector.add(Matter.Vector.add(Matter.Vector.add(tend_to_place(car),rule2(car)),rule3(car)),rule1(car));
        var goTo = { x: movementSpeed * Math.cos(car.angle + Math.PI) + v.x, y: movementSpeed * Math.sin(car.angle + Math.PI) +v.y};

        Matter.Body.setVelocity(car,v);
       // console.log(car.velocity);
            Matter.Body.translate(car,v);
            console.log(v);

            
           // Matter.Body.translate(car, { x: speed * Math.cos(car.angle + Math.PI), y: speed * Math.sin(car.angle + Math.PI) });
       
            // console.log(car.velocity);
        //console.log(car.position.x);helllo my name is nabhan maswood hello my name is nabhan maswood hell polydrvi.ei polydrive.io polydrive.io polydrvie.i

    },
    stopCar: function (car) {
        Matter.Body.setVelocity(car, { x: 0, y: 0 });
        car.stopped = true;

    },

    sendUpdates: function () {
        //eventuallly only send cars that are visble to the player
       
        function compare(a,b){
            
            if(a.manaCount < b.manaCount)
                return 1;
            else if (b.manaCount > a.manaCount)
                return -1;
            return 0;
        };

        this.players.sort(compare);
        var currentLB = []; //current leaderboard
        
        var createUpdate = (car) => {
            if(!car.spectating){
            if(currentLB.length <= 10){ 
                currentLB.push({name:car.playerName,score:car.manaCount});
            }

            var hDis = 2000; var yDis = 1200;
            var maxX = car.position.x + hDis;
            var maxY = car.position.y + yDis;
            var minX = car.position.x - hDis;
            var minY = car.position.y - yDis;
        }
        else{

            var hDis = 2000; var yDis = 1200;
            var maxX = car.x + hDis;
            var maxY = car.y + yDis;
            var minX = car.x - hDis;
            var minY = car.y - yDis;
        }
            var sentOtherCars = [];

            

            var sentUsers = this.players.filter((player)=>{ 
                var inView = false;

                if(player.spectating)
                    return false;
                
                
                if( (player.position.x < maxX && player.position.x > minX) &&  (player.position.y < maxY && player.position.y > minY))
                    inView = true;
                else
                    inView = false;

                    let onPlayer = car === player;
                    player.followerArray.forEach((carFollower) => {

                        if( (carFollower.position.x < maxX && carFollower.position.x > minX) &&  (carFollower.position.y < maxY && carFollower.position.y > minY))  
                            sentOtherCars.push({ id: carFollower.id, x: carFollower.position.x, y: carFollower.position.y, 
                                                angle: carFollower.angle, isFollower: (onPlayer) ? true : false,
                                                isLaunching: carFollower.launching,carIndex: carFollower.follower.carIndex
                                            
                                            
                                            });
                    });
                
            
                
                return inView;       
            
            
            
            
            }).map( (player) => {
                let onPlayer = car === player;
                if(onPlayer)
                    return { id: player.id, x: player.position.x, y: player.position.y,manaCount: player.manaCount, angle: player.angle, name: player.playerName };
                else
                    return { id: player.id, x: player.position.x, y: player.position.y, angle: player.angle, name: player.playerName,carIndex: player.carIndex };
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



            
            var d = new Date();
            this.sockets[car.id].emit("draw", sentUsers, sentMana,Date.now());
            
           // console.log(Date.now());


        };

        this.players.forEach((car)=>{
            createUpdate(car);

        });

        this.spectating.forEach((car)=>{createUpdate(car);});

        io.emit("leaderboard",currentLB);
        


 


    },

    moveCars: function () {

        
        this.players.forEach((car) => {
          // console.log( car.followerArray.length);
          if(car.spectating)
            return;
            
            car.followerArray.forEach((carFollower) => {
               

                if(carFollower.launching){
                    
                    this.moveCar(carFollower,carFollower.launchAngle,20);
                }
                else {
                    
                    var angle = Math.atan2((car.position.y - carFollower.position.y), (car.position.x - carFollower.position.x)) - (Math.PI);
                //    console.log(carFollower.position);
                    this.moveCar(carFollower, angle, 4);
                }

            });


        });


    },

 




    tick: function () {
        this.moveCars();
        //Engine.update(this.engine, 1000 / 60);
        
        
     ///   



    },

    tick2: function () {
        this.sendUpdates();

    }

};

 