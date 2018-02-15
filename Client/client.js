var socket = io({transports: ['websocket'], upgrade: false});

var Game = {
    
    app:  new PIXI.Application(1800, 1000, {backgroundColor : 0x1099bb}),

     mPlusX : 0,
     mPlusY : 0,
    amountFollowing : 0,
    
    init: function(){

        this.OnScreen = new PIXI.Container();
        this.OffScreen = new PIXI.Container();
        this.idArray = [];
        this.screenSprites = {};
        
        this.stop = false;
        document.body.appendChild(this.app.view);
        this.mouse = this.app.renderer.plugins.interaction.mouse.global;
        this.app.stage.addChild(this.OnScreen);

        var canvas = this;
        socket.emit("respawn");


        socket.on("welcome",function(car){
            canvas.car.x = car.x;
            canvas.car.y = car.y;
            canvas.car.id = car.id;
            socket.emit("ready");
          console.log(car.id);
        });

        socket.on("kicked",function(){

            canvas.stop = true;
            console.log("KCIKECKJEKCJEKJELC:JEKJCL:KEJCLEJM");
        });
        
        socket.on("draw",function(cars,environment){
            //Server sends positions of all objects. Client updates position placing the recently updates at the end of an array. Amount of sprites updated
            //is tracked in amount. If the array isn't = to the tracked amount this means the sprite should be removed. The front of the arry has the correct sprite
            //need to reuse sprites
            //need to move sprites

            var amount = 0;
            var size = canvas.OnScreen.children.length; 
           // console.log("size" + size);
           cars.forEach(function(u){
               // console.log(canvas.car.id);
                if (u.id === canvas.car.id){
                    //canvas.car.updated = true;
                    canvas.car.x = u.x;
                    canvas.car.y = u.y;
                   // amount++;
                  //  canvas.OnScreen.setChildIndex(canvas.car ,size - 1);

                }
                else if(canvas.screenSprites.hasOwnProperty(u.id)){
    
                    canvas.screenSprites[u.id].x = u.x;
                    canvas.screenSprites[u.id].y = u.y;
                   // canvas.screenSprites[u.id].drawn = true;
                    //json 
                    canvas.screenSprites[u.id].rotation = u.angle;
                    amount++;
                    canvas.OnScreen.setChildIndex(canvas.screenSprites[u.id] ,size - 1);

                }
                else{
                    var carSprite = new PIXI.Sprite.fromImage("/assets/carSprite.png");
                    carSprite.anchor.set(0.5,0.5);
                    //carSprite.updated = true;
                    carSprite.x = u.x;
                    carSprite.y = u.y;
                    carSprite.rotation = u.angle;
                    canvas.OnScreen.addChild(carSprite);
                    canvas.screenSprites[u.id] = carSprite;
                    amount++;
                    //canvas.OnScreen.setChildIndex(canvas.car ,size - 1);

                }


            });

            environment.forEach(function(sprites){
                if(canvas.screenSprites.hasOwnProperty(sprites.id)){
                    canvas.screenSprites[sprites.id].x = sprites.x;
                    canvas.screenSprites[sprites.id].y = sprites.y;
                    canvas.OnScreen.setChildIndex(canvas.screenSprites[sprites.id] ,size - 1);
                    amount++;

                }
                else{
                    //temp circle going to change to sprites eventually

                    var manaSprite = new PIXI.Graphics();
                   // manaSprite.anchor.set(0.5,0.5);
                    manaSprite.id = sprites.id;
                    manaSprite.x = sprites.x;
                    manaSprite.y = sprites.y;
                    manaSprite.beginFill(0xFFFFFF);
                    manaSprite.drawCircle(0,0,30);
                    manaSprite.endFill();
                    canvas.OnScreen.addChild(manaSprite);
                    canvas.screenSprites[sprites.id] = manaSprite;
                   
                    amount++;
                }
            });






            amount = size - amount;

            if(amount != 0){
                //canvas.OnScreen.removeChildren(0,amount);
                for (var i = 0; i < amount; i++){
                    canvas.OnScreen.removeChildAt(i);
                }
            }
           

            


            
        });

        socket.on();

        socket.on("moveCar2",function(carPositions){
            
            console.log(carPositions);
     });

        this.build();
          
        this.intialized = true;
    },

    build: function(){
        
        this.createCar();
    
       


    },

    

    createCar: function(){
        this.car = new PIXI.Sprite.fromImage("/assets/carSprite.png");
        this.car.anchor.set(0.5,0.5);
        this.car.id = -1;
        this.car.x = this.app.renderer.width / 2 ;
        this.car.y = this.app.renderer.height / 2;
        //this.car.rotation = 270 * (Math.PI / 180);
        

      

        this.app.stage.addChild(this.car);
        var gameThis = this;
        this.car.on("player",function(x2,y2){
            this.car.x = x2;
            this.car.y = y2;
    
        }.bind(gameThis));
    
    },

    setStage: function(x,y){
        //this.app.stage.x = x;
       // this.app.stage.y = y;
        this.app.stage.pivot = new PIXI.Point(x,y);
        this.mPlusX = x;
        this.mPlusY = y;




    },




  ticker: function(delta){
      var mouseX = this.mouse.x + this.mPlusX; var mouseY = this.mouse.y + this.mPlusY;
      var angle =   Math.atan2((mouseY - this.car.y),(mouseX - this.car.x)) - (Math.PI);
      this.car.rotation = angle;
 
     if(!this.stop){
        if(this.checkDistance(mouseX,mouseY) && this.mouse.x != 0 && this.car.id != -1){
            socket.emit("playerTick",{angle: this.car.rotation, stop: false});
        }
        else if (this.car.id != -1){

            socket.emit("playerTick",{angle: this.car.rotation, stop: true});
        }
    }
   
            
    
      
    
  },

  drawObject: function(blueprint){
    this.idArray.push(blueprint.id);
    console.log("Drawings");
   var car = new PIXI.Sprite.fromImage("/assets/carSprite.png");
    car.anchor.set(0.5,0.5);
    car.id = blueprint.id;
    car.x = blueprint.x;
    car.y = blueprint.y;
    
    this.OnScreen.on(car.id,function(x,y){
        car.x = x;
        car.y = y;

    });

   

    this.OnScreen.addChild(car);
    

  },

  moveOnScreen: function(id,x,y){
    // {isPlayer:false, id:true, x: 120, y:5, angle:180}
    if(id === "player"){
     //   this.car.emit("player",x,y);
    }
        
        else{
    //this.OnScreen.emit(id,x,y);
    }






  },


  keyboard: function(){
        




  },

  checkDistance: function(X,Y){
    if ((Y - this.car.y) <= 100 && (Y - this.car.y) >= -100){
        if ((X - this.car.x) <= 100 && (X - this.car.x) >= -100){
            return false;
        }
    }
    return true;

  }

 

  




};

    


var game = Object.create(Game);
game.init();
game.app.ticker.add(function(delta){game.ticker(delta);});