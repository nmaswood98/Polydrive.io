/*jshint esversion: 6 */


var socket = io({transports: ['websocket'], upgrade: false});

var GameNet = {
    
   d: new Date(),

    
    init: function(application,name,carIndex){
        this.app = application;
        this.travelTime = 0;
         this.game = Object.create(Game);
         this.game.init(application,name,carIndex);
         this.game.app.ticker.add((delta)=>{this.game.ticker(delta);});
         this.game.isDrawing = false;
        this.currentTime = this.d.getTime();
        this.lastTime = 0;
         this.serverUpdates = [];
      this.lastServerUpdate = null;
        var canvas = this.game;
        var that = this;
        socket.emit("respawn",name,carIndex);


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
        
        socket.on("draw",function(cars,environment,timeStamp){
            var d = new Date();
           var currentTime = d.getTime() - that.travelTime; //add /2
           that.travelTime =  Date.now() - timeStamp;
         //  console.log(that.travelTime); //outputs travel time
            var serverUpdate = [timeStamp ,cars,environment];
            that.serverUpdates.push(serverUpdate);
           // console.log(that.travelTime);
            
                if(that.lastTime === 0)

                if(that.serverUpdates.length >= (3000)) {
                   // that.serverUpdates.splice(0,1);
                }

             



            
        });

        socket.on("leaderboard",(a)=>{

            that.game.lBoard.updateLeaderboard(a);
        });

        socket.on("moveCar2",function(carPositions){
            
          //  console.log(carPositions);
     });

        
          
        this.intialized = true;
    },

    ticker: function(delta){
        

      var d = new Date();
      //console.log(Date.now());
                var currentTime = d.getTime() - this.travelTime;
               var offset = 100;
           
               var canDraw = false;
               if(true){
                  for(var i = 0; i < this.serverUpdates.length;i++ ) {
                      
                      element = this.serverUpdates[i];
                      var currentRenderingTime = currentTime - offset;
                      
                      if(element[0] >= currentRenderingTime ){
                        this.game.isDrawing = true;
                       this.game.draw(element[1],element[2],element[0] - currentRenderingTime);
                      
                       this.serverUpdates.splice(0,i + 1 );
                      break;
                      }
       
                  }
               }


        /*
        var nextFrame = null;
        for(var i = (this.serverUpdates.length - 1); i >= 0; i--){
            var timeD = currentTime - this.serverUpdates[i][0];
            if(timeD <= (offset + 20 ) && timeD >= (offset -20  ))
                {
                    canDraw = true;
                    this.game.isDrawing = true;
                    nextFrame = this.serverUpdates[i];
                 //   console.log(timeD);
                    this.game.draw(nextFrame[1],nextFrame[2],timeD);
                    break;


                }
            }
            */


    }
 

};
