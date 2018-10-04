/*jshint esversion: 6 */


var socket = io({transports: ['websocket'], upgrade: false});

var Manager = {
    
   d: new Date(),

    
    init: function(application,name,carIndex,menu){
        this.app = application;

        this.travelTime = 0;
        this.currentTime = this.d.getTime();
        this.lastTime = 0;
        this.serverUpdates = [];
        this.lastServerUpdate = null;
        
        var game = Object.create(Game);
        game.init(application,name,carIndex);
        game.app.ticker.add((delta)=>{game.ticker(delta);});
        game.isDrawing = false;
        game.hide();

        this.drawFrame = game.draw.bind(game); 

        this.spawn = (name,carIndex)=>{
             game.starting =true;
             socket.emit("spawn",name,carIndex);
             game.show();
             game.car.swapTexture(carIndex);
        };

        window.addCars = (amount)=>{
            var sc = 0.009467213*amount + 1.090164;
            if(amount < 15)
                sc = 1;
            else if (amount >=200)
                sc = 0.005*amount + 2;

          //  game.zoomTo(sc);
            console.log(sc);
            for(var i = 0; i < amount; i++)
                socket.emit("newC");
        };

        this.hideGame = game.hide.bind(game);
        console.log(menu);
        this.hideMenu = menu.hideMenu.bind(menu);
        this.showMenu = menu.showMenu.bind(menu);

        

        socket.on("welcome",(car)=>{
            game.car.x = car.x;
            game.car.y = car.y;
            game.car.id = car.id;
            socket.emit("ready");
        });

        socket.on("asdf",(asd)=>{
            console.log("ASDAFA");
        });

        socket.on("kicked",()=>{

            game.starting = false;
            
            //game.deleteCar();
            var blurFilter2 = new PIXI.filters.BlurFilter();
            
            blurFilter2.resolution = 0.5;
            blurFilter2.blur = 0;
            this.app.stage.filters = [blurFilter2]; 
            setTimeout( () => {TweenMax.to(blurFilter2 ,1.5,{
                ease:Linear.easeNone,
                blur:10
            }); }, 1500);
            setTimeout( () =>{this.hideGame(); this.showMenu(); this.app.stage.filters = [];  }, 3000);
            console.log("KCIKECKJEKCJEKJELC:JEKJCL:KEJCLEJM");
            game.car.visible = false;
        });
        
        socket.on("draw",(cars,environment,timeStamp)=>{
            var d = new Date();
           var currentTime = d.getTime() - this.travelTime; //add /2
           this.travelTime =  Date.now() - timeStamp;
         //  console.log(this.travelTime); //outputs travel time
            var serverUpdate = [timeStamp ,cars,environment];
            this.serverUpdates.push(serverUpdate);
           // console.log(this.travelTime);
            
                if(this.lastTime === 0)

                if(this.serverUpdates.length >= (3000)) {
                   // this.serverUpdates.splice(0,1);
                }

             



            
        });

        



        socket.on("leaderboard",(a)=>{

            game.lBoard.updateLeaderboard(a);
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
                        
                       this.drawFrame(element[1],element[2],element[0] - currentRenderingTime);
                      
                       this.serverUpdates.splice(0,i + 1 );
                      break;
                      }
       
                  }
               }



    }
 

};
