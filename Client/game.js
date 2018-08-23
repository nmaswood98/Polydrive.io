/*jshint esversion: 6 */



var Game = {
    
    app:  new PIXI.Application(1800, 1000, {backgroundColor : 0x27e85e}),

     mPlusX : 0,
     mPlusY : 0,
    amountFollowing : 0,
    
    init: function(application,name){
        createjs.Ticker.framerate = 60;
        this.lClick = false; 
        this.isDrawing = false;
        this.OnScreen = new PIXI.Container();
        this.OffScreen = new PIXI.Container();
        this.idArray = [];
        this.screenSprites = {};
        
        this.starting = true;
      
        //document.body.appendChild(this.app.view);
        this.app = application;
        this.mouse = this.app.renderer.plugins.interaction.mouse.global;
        this.app.stage.addChild(this.OnScreen);


        this.aKey = this.keyboard(70);

        this.aKey.press = function(){};
        this.aKey.release = function(){};
        
        this.sKey = this.keyboard(68);
        
        this.sKey.press = function(){};
        this.sKey.release = function(){};

        this.line = new PIXI.Graphics();
        this.line.car = null;
        this.app.stage.addChild(this.line);

        var texture = PIXI.Texture.fromImage('/assets/TextureBackground.png');



        this.tilingSprite = new PIXI.extras.TilingSprite(
            texture,
            15000,
            10000
        );
        this.app.stage.addChild(this.tilingSprite);
        
        this.app.stage.setChildIndex(this.tilingSprite,0);


        this.app.renderer.plugins.interaction.on('mousedown',() => {
            this.lClick = true;
           // console.log(this.lClick);
        });

        this.app.renderer.plugins.interaction.on('mouseup',  () => {
            this.lClick = false;
          //  console.log(this.lClick);
        });



        this.app.renderer.backgroundColor = 0xffffff;




        this.build();
          
        this.intialized = true;
    },

    build: function(){
        
        this.createCar();
    
       


    },

    

    createCar: function(){
        this.car = new PIXI.Sprite.fromImage("/assets/carSprite.png");
        this.car.interactive = true;
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
        //this.tilingSprite.pivot = new PIXI.Point(x,y);
        this.mPlusX = x;
        this.mPlusY = y;




    },

    addDegrees: function(){console.log("HEYELOELOELOELO"); },
    




  ticker: function(delta){
      var mouseX = this.mouse.x + this.mPlusX; var mouseY = this.mouse.y + this.mPlusY;

        this.line.clear();
        if(this.line.car != null){
            this.lClick = false;
            console.log("IT WORKING IT WORKING");
            this.line.lineStyle(10, this.line.color);
            this.line.moveTo(this.line.car.x,this.line.car.y);
            this.line.lineTo(mouseX, mouseY);
        }

      
      var angle =   Math.atan2((mouseY - this.car.y),(mouseX - this.car.x)) - (Math.PI);
    
      var angle2 = angle - this.car.rotation;

      if(!this.sKey.down)
        if(Math.abs((angle2 * 180)/Math.PI) >= 180){
       

           var angle3 = (2* Math.PI) - Math.abs(angle2);
           
            if(angle2 > 0){
                this.car.rotation = this.car.rotation - angle3 * 0.2;
           }
           else{
                this.car.rotation = this.car.rotation + angle3 * 0.2;
           }

           if((this.car.rotation * 180)/Math.PI < -360)
                this.car.rotation = (2* Math.PI) + this.car.rotation;
           else  if((this.car.rotation * 180)/Math.PI > 10){
               console.log("AYY LMAO");
               this.car.rotation = this.car.rotation - (2* Math.PI) ;
         //   console.log((this.car.rotation * 180)/Math.PI);

           }

                
        
        }
        else{
            this.car.rotation = this.car.rotation + angle2 * 0.2 ;

        }
           
            
    
      //  console.log((angle2 * 180)/Math.PI);
    
        
   //     console.log(Math.abs(this.car.rotation)* 180/Math.PI);


      
        
 
     if(this.starting && this.car.id != -1){
        if(this.checkDistance(mouseX,mouseY) && this.mouse.x != 0 && !this.aKey.down){
            socket.emit("playerTick",{angle: this.car.rotation, stop: false, leftClick: this.lClick});
        }
        else{
           
            socket.emit("playerTick",{angle: this.car.rotation, stop: true,leftClick: false});
        }
    }
   
    this.setStage(this.car.x - (this.app.renderer.width / 2), this.car.y - (this.app.renderer.height / 2));
    
      
    
  },

  draw: function(cars,environment,timeDelta){
  //Server sends positions of all objects. Client updates position placing the recently updates at the end of an array. Amount of sprites updated
            //is tracked in amount. If the array isn't = to the tracked amount this means the sprite should be removed. The front of the arry has the correct sprite
            //need to reuse sprites
            //need to move sprites

            createjs.Tween.removeAllTweens();

            var amount = 0;
            var size = this.OnScreen.children.length; 
           // console.log("size" + size);
           cars.forEach((u) => {
           
           var ayy = 0;
               
                if (u.id === this.car.id){
                    //Tween
                    createjs.Tween.get(this.car).to({x:u.x,y:u.y},timeDelta).call(()=>{ this.isDrawing = false;});
                  //  createjs.Tween.get(this.app.stage.pivot).to({x:u.x - (this.app.renderer.width / 2),y: u.y - (this.app.renderer.height / 2)},timeDelta);
                  //  this.car.x = u.x;
                  //  this.car.y = u.y;
                  //  this.isDrawing = false;
                 //   console.log(u.x  + "HEL" + u.y);
                 

                }
                else if(this.screenSprites.hasOwnProperty(u.id)){
                   //Tween
                   createjs.Tween.get(this.screenSprites[u.id]).to({x:u.x,y:u.y},timeDelta);
                  // TweenLite.to(demo, 20, {score:100, onUpdate:showScore})
                   // this.screenSprites[u.id].x = u.x;
                  //  this.screenSprites[u.id].y = u.y;

                    //Tween
                    createjs.Tween.get(this.screenSprites[u.id]).to({rotation:u.angle},timeDelta);
                   // this.screenSprites[u.id].rotation = u.angle;
                    amount++;
                    ayy++;


                   
                    if(u.isFollower === true){
                        this.screenSprites[u.id].interactive = true;
                    }
                    else{
                        this.screenSprites[u.id].interactive = false;
                    }

                    this.OnScreen.setChildIndex(this.screenSprites[u.id] ,size - 1);
                    
                    
                    if(u.name != undefined){
                        console.log("helhelfhelf");
                        //Tween
                        createjs.Tween.get(this.screenSprites[u.id]).to({x:u.x,y:u.y - 110},timeDelta);
                       // this.screenSprites[u.id].nameLabel.x = u.x ;
                       // this.screenSprites[u.id].nameLabel.y = u.y - 110;

                    }
                    

                }
                else{
                    
                    var carSprite = new PIXI.Sprite.fromImage("/assets/carSprite.png");
                    carSprite.interactive = false;
                    carSprite.anchor.set(0.5,0.5);
                    //carSprite.updated = true;
                    carSprite.x = u.x;
                    carSprite.y = u.y;
                    carSprite.id = u.id;
                    carSprite.rotation = u.angle;

                    

                    carSprite.on('pointerdown', () => {
                        console.log("PEPEfasdfasdfsafdasdfasdfsadfsa");
                        this.line.car = carSprite;
                        this.line.color = this.randomColor();
                        carSprite.alpha = 0.5;
                    });
                    carSprite.on('pointerup', ()=>{
                        console.log("!@#$%^&");
                        this.line.car = null;
                        carSprite.alpha = 1;
            
                    });
            
                    carSprite.on('pointerupoutside', ()=>{
                        console.log("qwertyuiopasdfghjkl");
                        this.line.car = null;
                        carSprite.alpha = 1;
                        
                        var mouseX = this.mouse.x + this.mPlusX; var mouseY = this.mouse.y + this.mPlusY;
                        socket.emit("launch",{x:carSprite.x,y:carSprite.y,mX:mouseX,mY:mouseY}); //launching car
            
                    });



                    this.OnScreen.addChild(carSprite);
                    this.screenSprites[u. id] = carSprite;
                    amount++;
                    ayy++;

                  

                 

                    var style = new PIXI.TextStyle({
                        fontFamily: 'Arial',
                        fontSize: 20,
                       
                        
                        fill: ['#9a41c6'], // gradient
                        
                        dropShadow: true,
                        dropShadowColor: '#000000',
                        dropShadowBlur: 4,
                        dropShadowAngle: Math.PI / 6,
                        dropShadowDistance: 6,
                        wordWrap: true,
                        wordWrapWidth: 440
                    });

                    if(u.name != undefined){

                        console.log("helhelfhelf");
                        var playerName = new PIXI.Text(u.name,style); 
                        playerName.x = carSprite.x;
                        playerName.y = carSprite.y  - 110;
                        carSprite.nameLabel = playerName;
                      
                        this.app.stage.addChild(playerName);
                        //this.app.stage.setChildIndex(this.tilingSprite,0);
                    }

                    //this.OnScreen.setChildIndex(this.car ,size - 1);

                }
               // console.log(ayy);

            });

            environment.forEach((sprites) => {
                if(this.screenSprites.hasOwnProperty(sprites.id)){
                    //Tween
                    createjs.Tween.get(this.screenSprites[sprites.id]).to({x:sprites.x,y:sprites.y},timeDelta);
                   // this.screenSprites[sprites.id].x = sprites.x ;
                  //  this.screenSprites[sprites.id].y = sprites.y ;
                    this.OnScreen.setChildIndex(this.screenSprites[sprites.id] ,size - 1);
                    amount++;

                }
                else{
                    //temp circle going to change to sprites eventually

                    var manaSprite = new PIXI.Graphics();
                   // manaSprite.anchor.set(0.5,0.5);
                    manaSprite.id = sprites.id;
                    manaSprite.x = sprites.x;
                    manaSprite.y = sprites.y;
                    manaSprite.beginFill(this.randomColor());
                 //   console.log("MANA DRAWN");
                    manaSprite.drawCircle(0,0,10);
                    manaSprite.endFill();
                    this.OnScreen.addChild(manaSprite);
                    this.screenSprites[sprites.id] = manaSprite;
                   
                    amount++;
                }
            });



            


            amount = size - amount;

            if(amount != 0){
                //this.OnScreen.removeChildren(0,amount);
                for (var i = 0; i < amount; i++){
                    this.app.stage.removeChild(this.screenSprites[this.OnScreen.children[i].id].nameLabel);
                    delete this.screenSprites[this.OnScreen.children[i].id];
                    this.OnScreen.removeChildAt(i);
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

  near: function(value,expectedValue,buffer){
    var max = expectedValue + buffer;
    var min = expectedValue - buffer;
    return ((value < max) && (value > min));

  },


  keyboard: function(keyCode){
    let key = {};
    key.code = keyCode;
    key.down = false;
    key.press = undefined;
    key.release = undefined;
    
    key.downHandler = event => {
      if (event.keyCode === key.code) {
         key.press();
         key.down = true;
      
      }
      event.preventDefault();
    };
  
    
    key.upHandler = event => {
      if (event.keyCode === key.code) {
       key.release();
       key.down = false;
       
      }
      event.preventDefault();
    };
  
    
    window.addEventListener(
      "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
      "keyup", key.upHandler.bind(key), false
    );
    return key;
  },

  randomColor: function(){
   
        var rando =  Math.floor(Math.random() * (5 - 1 + 1) ) + 1;
        console.log("HEYO");

    switch (rando) {
        case 1:
            return 0xffb400;
        case 2:
            return 0xff0000;
        case 3:
            return 0x7cc576;
        case 4:
            return 0x00e4ff;
        case 5:
            return 0xcd81ff;
        

            
            
        
    
        default:
            
            break;
    }



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
