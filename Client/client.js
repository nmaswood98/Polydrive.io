/*jshint esversion: 6 */




var Manager = {
    
   d: new Date(),

    
    init: function(serverIP,application,name,menu){
        
        this.app = application;
        ////console.log(serverIP);
        var primus = null;
        var socket = {};
        this.travelTime = 0;
        this.currentTime = this.d.getTime();
        this.lastTime = 0;
        this.serverUpdates = [];
        this.lastServerUpdate = null;

        

        
        
        var game = Object.create(Game);
        game.init(primus,application,name,menu.cCarIndex);
        game.app.ticker.add((delta)=>{game.ticker(delta);});
        game.isDrawing = false;
        game.hide();


        window.addEventListener('resize',()=>{

            this.app.renderer.resize(window.innerWidth*2, window.innerHeight*2);
            this.app.renderer.view.style.width = this.app.screen.width/2 + "px";
            this.app.renderer.view.style.height = this.app.screen.height/2 + "px";
            menu.updateSize();
            game.updateSize(window.innerWidth*2, window.innerHeight*2);
            
        });

        this.drawFrame = game.draw.bind(game); 

        this.hideGame = game.hide.bind(game);
        ////console.log(menu + "49");
        this.hideMenu = menu.hideMenu.bind(menu);
        this.showMenu = menu.showMenu.bind(menu);

        this.createSocket = (serverIP) =>{
            if(primus === null){
                primus = new Primus(serverIP);
                initializeSocket(primus);
            }
            else{
                primus.destroy();
                primus = new Primus(serverIP);
                initializeSocket(primus);
                
            }
        };

        

        var initializeSocket = (p) =>{
            game.setSocket(p);
            p.on('data',  (data) => {
                switch(data[0]) {
                            case 0: //draw ///Check if scope effected this code
                                    let d = new Date();
                                    let timeStamp = data.pop();
                                    let currentTime = d.getTime() - this.travelTime; //add /2
                                    this.travelTime =  Date.now() - timeStamp;
                                    let serverUpdate = [timeStamp, data];
                                    this.serverUpdates.push(serverUpdate);
                                    break;
                            case 1: //Welcome
                                    game.car.x = data[1];
                                    game.car.y = data[2];
                                    game.car.id = "Player";
                                    game.resizeGame(data[3]);
                                    menu.hideMenu();
                                    game.show();
                                    game.car.swapTexture(menu.cCarIndex);
                                    break;
                            case 2: //kicked
                                    game.starting = false;
                                    //blur
                                    var blurFilter2 = new PIXI.filters.BlurFilter();
                                    blurFilter2.resolution = 0.5;
                                    blurFilter2.blur = 0;
                                    this.app.stage.filters = [blurFilter2]; 
                                    setTimeout( () => {TweenMax.to(blurFilter2 ,1.5,{
                                        ease:Linear.easeNone,
                                        blur:10
                                    }); }, 1500);
                                    //b
                                    setTimeout( () =>{this.hideGame(); this.showMenu(); this.app.stage.filters = [];  }, 3000);

                                    game.car.visible = false;
                                    break;
                            case 3: //Leaderboard
                                    game.lBoard.updateLeaderboard(data);
                                    break;
                            case 5:
                                    this.app.notify("Servers Full.");
                                    break;
                            default:
                                    console.log("ERROR: Unrecognized packet from the server", data);
                }
              });

        };

        
        this.spawn = (name,carIndex)=>{
            
             game.starting =true;
             if(primus != null)
                primus.write(["spawn",name,carIndex]);
            else
                {
                    this.app.notify("Servers Full.");
                    fetch("/GameServer/east")
                    .then((response) => {
                            return response.text();
                                        })
                        .then((serverIP) => {
                            if(serverIP != '0')
                                this.createSocket(serverIP);
                            });

                }
            
           
        };

        window.addCars = (amount)=>{
            var sc = 0.009467213*amount + 1.090164;
            if(amount < 15)
                sc = 1;
            else if (amount >=200)
                sc = 0.005*amount + 2;

          //  game.zoomTo(sc);
            //console.log(sc);
            for(var i = 0; i < amount; i++)
                socket.emit("newC");
        };

    

        
        
        
       

        
          
        this.intialized = true;
    },

    ticker: function(delta){
        

                var d = new Date();
      ////console.log(Date.now());
                var currentTime = d.getTime() - this.travelTime;
               var offset = 100;
           
               var canDraw = false;
               
               if(true){
                  for(var i = 0; i < this.serverUpdates.length;i++ ) {
                      
                      element = this.serverUpdates[i];
                      var currentRenderingTime = currentTime - offset;
                      
                      if(element[0] >= currentRenderingTime ){
                        
                      // this.drawFrame(element[1],element[2],element[0] - currentRenderingTime);
                      this.drawFrame(element[1],element[0] - currentRenderingTime);
                      
                       this.serverUpdates.splice(0,i + 1 );
                      break;
                      }
       
                  }
               }



    }
 

};


