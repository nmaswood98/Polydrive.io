/*jshint esversion: 6 */


var Collisions = require('detect-collisions').Collisions;

var Car = require('./Worlditems.js').WorldItems.Car;
var Vector = require('./Worlditems.js').WorldItems.Vector;
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



var socketIO = require('socket.io');





function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

var io;

module.exports.Game = {

    init: function (server) {
     


        io = socketIO(server);
        this.updateRate = 20;
        
        
     
        this.system = new Collisions();
       // console.log(Collisions);
        this.result = this.system.createResult();

        this.worldY = 5000;
        this.worldX = 7500;
    
        var lastUpdate = Date.now();
        setInterval(this.tick.bind(this), 1000 / 60);
        setInterval(this.tick2.bind(this), 1000 / this.updateRate);
    
        this.players = []; 
        this.spectating = [];
        this.otherCars = [];
        this.manaPool = [];
        this.sockets = {};

///GameBoardasdfasdfasfdadf

        this.addMana = () =>{ //Fix for new system
            var mana = this.system.createCircle(getRndInteger(0,this.worldX/4 ), getRndInteger(0,this.worldY/4), 20);
            mana.id = "mana" + (this.manaPool.length + 1).toString();
            this.manaPool.push(mana);

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
                        elem.cBody.remove();
                    });
                    
                   
                    currentCar.cBody.remove(); //removes body from collision system
                    delete this.sockets[currentCar.id];
                }
                //this.sockets[socket.id].disconnect();

            });

          

            socket.on("spawn",(name,cI) =>{
            
                currentCar = Car.create(socket.id,true, {x:(getRndInteger(0,this.worldX)),y:(getRndInteger(0,this.worldY))},this.system);
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
               // World.add(this.engine.world, currentCar.body);
                socket.inGame = true;
                for(var e = 0; e < 0; e++){
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
                        this.moveCar(1,currentCar, carInfo.angle, currentCar.speed);

                    
                }
                else{
                    //this.car.stopped = false; 
                    currentCar.speed = currentCar.speed * 0.95;
                   // this.stopCar(currentCar);
                   currentCar.stopped = true;
                   this.moveCar(1,currentCar, carInfo.angle, currentCar.speed);
                }
            }
            });

            socket.on("launch", (mouseInfo) => {


            });
            

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

  



    newCarFollower: function(playerCar){
        //console.log(playerCar.);
        var carLoc = Vector.rotate({x:150,y:0}, playerCar.angle);
        //var newCar = this.playerJoined(Math.random().toString(36).substring(7),playerCar.position.x + carLoc.x,playerCar.position.y + carLoc.y); //Every car needs a random id in order to function properly
        var newCar = Car.create(Math.random().toString(36).substring(7),false,{x: playerCar.position.x + carLoc.x,y:playerCar.position.y + carLoc.y},this.system);
       
       // World.add(this.engine.world, newCar.body);
        this.addCarFollower(playerCar,newCar,false);
      
       // newCar.moving = true;
    },


    moveCar: function (dt,car, angle, speed) {
       // Matter.Body.setAngle(car.body, angle);
       car.angle = angle;
       // console.log(angle * (180/Math.PI)) + 360;
       // car.body.angle = angle;
        if(car.follower === car){
           // console.log(car.position);
          //  Matter.Body.setVelocity(car.body, { x: speed * Math.cos(car.angle + Math.PI), y: speed * Math.sin(car.angle + Math.PI) });
            car.velocity = { x: speed * Math.cos(car.angle + Math.PI) * dt , y: speed * Math.sin(car.angle + Math.PI) * dt };
          //  Matter.Body.translate(car.body, { x: speed * Math.cos(car.angle + Math.PI), y: speed * Math.sin(car.angle + Math.PI) });
            car.translate(car.velocity);
            return;
        }

        if(car.launching){
           // console.log(car.velocity);
           // Matter.Body.translate(car, { x: speed * Math.cos(car.angle + Math.PI), y: speed * Math.sin(car.angle + Math.PI) });
           // Matter.Body.setVelocity(car, { x: speed * Math.cos(car.angle + Math.PI), y: speed * Math.sin(car.angle + Math.PI) });
           car.velocity = {x:0,y:0};
            car.velocity = { x: speed * Math.cos(car.angle + Math.PI) * dt, y: speed * Math.sin(car.angle + Math.PI) * dt };
            car.translate(car.velocity);
            return;
        }

        var movementSpeed = speed * dt;
        if(!(car === car.follower) && !(car.launching)){
        if(car.follower.rClick)
            movementSpeed = speed * dt;
        else 
            movementSpeed = car.follower.speed * dt;
            
        
       
        }

 
        

        function avoidDir(car1,speed){
            let potentials = car1.cBody.potentials();
            var steer = {x:0,y:0};
            var count = 0;
            console.log(potentials.length);
            potentials.forEach(element1 => {
                if(element1.par.follower != undefined){
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

            var hDis = 4000/1; var yDis = 2200/1;
            var maxX = car.position.x + hDis;
            var maxY = car.position.y + yDis;
            var minX = car.position.x - hDis;
            var minY = car.position.y - yDis;
        }
        else{

            var hDis = 4000/1; var yDis = 2200/1;
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
                
                
                if( (player.x < maxX && player.x > minX) &&  (player.y < maxY && player.y > minY))
                    inView = true;
                else
                    inView = false;
                
            
                
                return inView;       
            
            
            
            
            }).map(function (mana) {
                return { id: mana.id, x: mana.x, y: mana.y };




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

    moveCars: function (dt) {

        
        this.players.forEach((car) => {
          // console.log( car.followerArray.length);
          if(car.spectating)
            return;
            
            car.followerArray.forEach((carFollower) => {
               

                if(carFollower.launching){
                    
                    this.moveCar(dt,carFollower,carFollower.launchAngle,20);
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

    processCollisions: function (){
        
        this.players.forEach(player => {
            let potentials = player.cBody.potentials();
            potentials.forEach(body => { //Player is a Car object while body is just a collision body. body.par gives you the Car object 

                if(body.par === undefined){ //Is Mana
                    //handle mana collision

                    body.remove();
                    player.manaCount++;
                    var manaIndex = this.manaPool.indexOf(body);
                    this.manaPool.splice(manaIndex, 1);

                    if(player.manaCount % 100 === 0)
                        this.newCarFollower(player);



                }
                else if(player.follower.id != body.par.follower.id){ //Enemy Car Collision

                    if(player.cBody.head.collides(body,this.result)) {
                        if(player.cBody.head.collides(body.head)){
                            console.log("ERROR");
                        }else{
                            this.playerLost(body.par,player);
                            console.log(player.playerName);
                        }
                        player.translate({x:-(this.result.overlap * this.result.overlap_x),y:-(this.result.overlap * this.result.overlap_y)});

                    }

                }

            });

        player.followerArray.forEach(childCar => {
            potentials = childCar.cBody.potentials();
            potentials.forEach(body => {
                if(body.par === undefined){ //Is Mana
                    //handle mana collision
                    body.remove();
                    player.manaCount++;
                    var manaIndex = this.manaPool.indexOf(body);
                    this.manaPool.splice(manaIndex, 1);

                    if(player.manaCount % 100 === 0)
                        this.newCarFollower(player);


                }
                else if(childCar.follower.id != body.par.follower.id){ //Enemy Car Collision

                    if(childCar.cBody.head.collides(body,this.result)) {
                        if(childCar.cBody.head.collides(body.head)){
                                console.log("ERROR");
                        }else{
                                this.playerLost(body.par,player);
                                console.log(childCar.playerName);
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
