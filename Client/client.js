/*jshint esversion: 6 */


var socket = io({transports: ['websocket'], upgrade: false});

var GameNet = {
    
   d: new Date(),

    
    init: function(application,name){
        var game = Object.create(Game);
        game.init(application,name);
        game.app.ticker.add(function(delta){game.ticker(delta);});
        this.currentTime = this.d.getTime();

        var serverUpdates = [];
      
        var canvas = game;
        var that = this;
        socket.emit("respawn",name);


        socket.on("welcome",function(car){
            canvas.car.x = car.x;
            canvas.car.y = car.y;
            canvas.car.id = car.id;
            socket.emit("ready");
        //  console.log(car.id);
        });

        socket.on("kicked",function(){

            canvas.starting = false;
            console.log("KCIKECKJEKCJEKJELC:JEKJCL:KEJCLEJM");
        });
        
        socket.on("draw",function(cars,environment){
            that.currentTime = that.d.getTime();
            var serverUpdate = [that.currentTime,cars,environment];
                serverUpdates.push(serverUpdate);
            
            if ( serverUpdates.length === 3 ){
                var nextUpdate = serverUpdates.shift();
                var timeDif = that.currentTime - nextUpdate[0];
                canvas.draw(nextUpdate[1],nextUpdate[2],timeDif);
            
            }
            


            
        });

        socket.on();

        socket.on("moveCar2",function(carPositions){
            
          //  console.log(carPositions);
     });

        
          
        this.intialized = true;
    }

 

};
