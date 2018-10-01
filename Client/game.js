/*jshint esversion: 6 */



var Game = {
    
    

     mPlusX : 0,
     mPlusY : 0,
    amountFollowing : 0,
    
    init: function(application,name,carIndex){
        this.carIndex = carIndex;
        
        this.app = application;
        this.stage = new PIXI.Container(); //Main Container for everything in the game

        //this.stage is a child of viewport and viewport is a  child of this.app.stage
        //viewport allows zooming of the view. this.stage contains all the sprites for the game
        var viewport = new  PIXI.extras.Viewport({ //for zooming
            screenWidth: window.innerWidth * 2,
            screenHeight: window.innerHeight * 2,
            worldWidth: this.app.width,
            worldHeight: this.app.height,
        
            interaction: this.app.renderer.interaction
        });

        

        viewport.addChild(this.stage);
        this.app.stage.addChild(viewport);
        //viewport plugins for zooming
        viewport.wheel({center:{x:this.app.screen.width/2,y:this.app.screen.height/2}});
       // viewport.clampZoom({maxWidth: this.app.renderer.width,maxHeight: this.app.renderer.height});

        this.hide = ()=>{
    
            viewport.visible = false;
            this.lBoard.visible = false;
            this.sLabel.visible = false;
            
            console.log(this);
        }

        this.show = ()=>{
            viewport.visible = true;
            this.lBoard.visible = true;
            this.sLabel.visible = true;
            this.car.visible = true;

        }
        //

        //funciton that changes the max zoom
        this.setMaxZoom = (x,y)=>{viewport.clampZoom({maxWidth: x,maxHeight: y});};
        //

        this.spriteSheet = PIXI.loader.resources["/polydriveSpriteSheet.json"].textures; 
        createjs.Ticker.framerate = 60;
        TweenMax.ticker.fps(60);
     
        this.lClick = false; 
        this.rClick = false;
        this.isDrawing = false;
        this.OnScreen = new PIXI.Container();
        this.OffScreen = new PIXI.Container();
        this.idArray = [];
        this.screenSprites = {};
        this.carrotation = 0;
        this.starting = true;

        //Set Up Animation Arrays
        this.animationArray = [];
        PIXI.loader.resources["/polydriveSpriteSheet.json"].data.animations.nitro.forEach(element => {
            this.animationArray.push(this.spriteSheet[element]);
        }); 
        

        ///
      
        //document.body.appendChild(this.app.view);
        this.app.renderer.plugins.interaction.supportsTouchEvents = true;
        this.mouse = this.app.renderer.plugins.interaction.mouse.global;
        this.stage.addChild(this.OnScreen);


        this.aKey = this.keyboard(70);

        this.aKey.press = function(){};
        this.aKey.release = function(){};
        
        this.sKey = this.keyboard(68);
        
        this.sKey.press = function(){};
        this.sKey.release = function(){};

        this.line = new PIXI.Graphics();
        this.line.car = null;
        this.launchedCar = null;
        this.app.stage.addChild(this.line);

        //LeaderBoard
        this.lBoard = Leaderboard.create(this.app);
        this.sLabel = ScoreLabel.create(this.app);
       // this.lBoard.updateLeaderboard([{name:"nabhan",score:231}]);
        this.lBoard.updateLeaderboard([{name:'nabhan',score:1},{name:"maswood",score:1},{name:"pablo",score:1}]);
        //



        this.tilingSprite = new PIXI.extras.TilingSprite(
            this.spriteSheet["TextureBackground.png"],
            7500,
            5000
        );
        this.stage.addChild(this.tilingSprite);
        
        this.stage.setChildIndex(this.tilingSprite,0);


        this.app.renderer.plugins.interaction.on('mousedown',() => {
            if(this.rClick)
                this.rClick = false;

            this.lClick = true;
           // console.log(this.lClick);
        });

        this.app.renderer.plugins.interaction.on('rightdown',() => {
            if(this.lClick)
                this.lClick = false;

            this.rClick = true;
           // console.log(this.lClick);
        });

        this.app.renderer.plugins.interaction.on('rightup',() => {
            this.rClick = false;
            this.lClick = false;
           // console.log(this.lClick);
        });



        this.app.renderer.plugins.interaction.on('mouseup',  () => {
            this.lClick = false;
            this.rClick = false;
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
        let carName = "car12_blue.png"; //Player eventually gets to choose
        
        this.car = new PIXI.Sprite(this.spriteSheet[this.carIndex]);
        this.car.interactive = true;
        this.car.anchor.set(0.5,0.5);
        this.car.id = -1;
        this.car.scale.x = 4.382353;
        this.car.scale.y = 4.382353;
        this.car.x = this.app.screen.width / 2 ;
        this.car.y = this.app.screen.height / 2;
        //this.car.rotation = 270 * (Math.PI / 180);

        
      

        this.stage.addChild(this.car);
        var gameThis = this;
        this.car.on("player",function(x2,y2){
            this.car.x = x2;
            this.car.y = y2;
           
        }.bind(gameThis));

        this.car.swapTexture = (index)=>{
            this.carIndex = index;
            this.car.texture = this.spriteSheet[this.carIndex];
        };

        
    
    },

    deleteCar: function(){
        this.stage.removeChild(this.car);
    },

   
    setStage: function(x,y,x1,y1){
        //this.stage.x = x;
       // this.stage.y = y;
        this.stage.pivot = new PIXI.Point(x1,y1);
       //this.stage.moveCorner(x1,y1);
       
      // console.log(this.car.x);
        //this.tilingSprite.pivot = new PIXI.Point(x,y);
        this.mPlusX = x ;
        this.mPlusY = y;




    },

    addDegrees: function(){console.log("HEYELOELOELOELO"); },
    




  ticker: function(delta){
    //  console.log(TweenMax.ticker.fps);
      var mouseX = this.mouse.x + this.mPlusX; var mouseY = this.mouse.y + this.mPlusY;
      //  console.log(mouseX)
        this.line.clear();
        if(this.line.car != null){
            this.lClick = false;
            this.rClick = false;
          //  console.log("IT WORKING IT WORKING");
            this.line.lineStyle(10, this.line.color);
           // var pos = this.line.car.parent.toGlobal();
            var pos = this.line.car.getGlobalPosition();
            this.line.moveTo(pos.x   ,pos.y  );
            this.line.lineTo(mouseX - this.mPlusX, mouseY - this.mPlusY);
        }

      
      var angle =   Math.atan2((mouseY - this.car.y),(mouseX - this.car.x)) - (Math.PI);
    
      var angle2 = angle - this.carrotation;

      if(!this.sKey.down)
        if(Math.abs((angle2 * 180)/Math.PI) >= 180){
       

           var angle3 = (2* Math.PI) - Math.abs(angle2);
           
            if(angle2 > 0){
                this.carrotation = this.carrotation - angle3 
           }
           else{
                this.carrotation = this.carrotation + angle3 
           }

           if((this.carrotation * 180)/Math.PI < -360)
                this.carrotation = (2* Math.PI) + this.carrotation;
           else  if((this.carrotation * 180)/Math.PI > 10){
               
               this.carrotation = this.carrotation - (2* Math.PI) ;
         //   console.log((this.car.rotation * 180)/Math.PI);

           }

                
        
        }
        else{
            this.carrotation = this.carrotation + angle2 * 0.2 ;

        }
           
            
    
      //  console.log((angle2 * 180)/Math.PI);
    
        
   //     console.log(Math.abs(this.car.rotation)* 180/Math.PI);


      
        
        if(this.starting)
     if(this.starting && this.car.id != -1){
        if(this.checkDistance(mouseX,mouseY) && this.mouse.x != 0 && !this.aKey.down){
            socket.emit("playerTick",{angle: this.carrotation, stop: false, leftClick: this.lClick,rightClick: this.rClick},this.launchedCar);
            this.launchedCar = null;
        }
        else{
           
            socket.emit("playerTick",{angle: this.carrotation, stop: true,leftClick: false},this.launchedCar);
            this.launchedCar = null;
        }
    }
   
  // console.log(this.app.renderer);
  if(this.starting)
    this.setStage(this.car.x - (this.app.renderer.width/2 ), this.car.y - (this.app.renderer.height/2),this.car.x - (this.app.screen.width/2 ), this.car.y - (this.app.screen.height/2));
      //  console.log(this.car.rotation);
      
    
  },


  draw: function(cars,environment,timeDelta){
      var interpolation = true;
    console.log(this);
  //Server sends positions of all objects. Client updates position placing the recently updates at the end of an array. Amount of sprites updated
            //is tracked in amount. If the array isn't = to the tracked amount this means the sprite should be removed. The front of the arry has the correct sprite
            //need to reuse sprites
            //need to move sprites
           // console.log(timeDelta);
         //  createjs.Tween.removeAllTweens();
        // if(this.isDrawing){
        //TweenMax.killChildTweensOf(this.car);
          //TweenMax.killAll();
          // this.isDrawing = false;
       //  }
            var amount = 0;
            var size = this.OnScreen.children.length; 
            var updatedChildArray = [];
           // console.log("size" + size);
           cars.forEach((u) => {
           
           var ayy = 0;
               
                if (u.id === this.car.id){
                    //Tween
                   //  createjs.Tween.get(this.car).to({x:u.x,y:u.y},timeDelta).call(()=>{});
                    function notDrawing(){
                        this.isDrawing = false;
                        console.log("WHAT");

                    }

                    
                    if(interpolation){
                        TweenMax.to(this.car,timeDelta/1000,{
                            ease:Linear.easeNone,
                            pixi:{x:u.x,y:u.y},
                            directionalRotation:{
                                rotation: (u.angle - (Math.PI/2)) + "_short",
                                useRadians: true
                            },
                            overwrite:"all",
                            onComplete:notDrawing
                    
                    
                        });
                    }
                    else{
                        console.log("FJKJKFJDLSAFKDSJFKDJLKJFDS");
                        this.car.x = u.x;
                        this.car.y = u.y;
                        this.car.rotation = (u.angle - (Math.PI/2));
                    }

                    


                 //   console.log((this.car.rotation * 180)/Math.PI +" new " + (u.angle * 180)/Math.PI);
                 //   createjs.Tween.get(this.car).to({rotation:u.angle},timeDelta);
                  // this.car.rotation = 0;
                  //  createjs.Tween.get(this.stage.pivot).to({x:u.x - (this.app.renderer.width / 2),y: u.y - (this.app.renderer.height / 2)},timeDelta);
                ///    this.car.x = u.x;
                ///    this.car.y = u.y;
                  //  this.isDrawing = false;
                 //   console.log(u.x  + "HEL" + u.y);
                 
                 this.sLabel.updateScoreLabel(u.manaCount);
                }
                else if(this.screenSprites.hasOwnProperty(u.id)){
                   //Tween
                 //  createjs.Tween.get(this.screenSprites[u.id]).to({x:u.x,y:u.y},timeDelta);
                  // TweenLite.to(demo, 20, {score:100, onUpdate:showScore})
                //    this.screenSprites[u.id].x = u.x;
                //    this.screenSprites[u.id].y = u.y;
                  TweenMax.to(this.screenSprites[u.id],timeDelta/1000,{
                    ease:Linear.easeNone,
                    pixi:{x:u.x,y:u.y},
                    overwrite:"all",
                    directionalRotation:{
                        rotation: (u.angle- (Math.PI/2)) + "_short",
                        useRadians: true
                    }
                
                
                });
           

                if(u.isLaunching){
                    //console.log(this.screenSprites[u.id].anim);
                    if(this.screenSprites[u.id].anim == null && !(this.screenSprites[u.id].isLaunching) ){
                        this.screenSprites[u.id].isLaunching = true;
                        this.screenSprites[u.id].launchAnimation();
                    }
                }
                else{
                    this.screenSprites[u.id].isLaunching = false;
                }
                

            
                    amount++;
                    ayy++;


                   
                    if(u.isFollower === true){
                        this.screenSprites[u.id].interactive = true;
                    }
                    else{
                        this.screenSprites[u.id].interactive = false;
                    }
                    updatedChildArray.push(u.id);
                  
                    
                    
                    if(u.name != undefined){
                        console.log("helhelfhelf");
                        //Tween
                   
                        createjs.Tween.get(this.screenSprites[u.id].nameLabel).to({x:u.x,y:u.y - 110},timeDelta);
                        
                       // this.screenSprites[u.id].nameLabel.x = u.x ;
                       // this.screenSprites[u.id].nameLabel.y = u.y - 110;

                    }
                    

                }
                else{
                    var carName = "car14_red.png";
                    var carSprite = new PIXI.Sprite(this.spriteSheet[u.carIndex]);
                    carSprite.interactive = false;
                    carSprite.anchor.set(0.5,0.5);
                    //carSprite.updated = true;
                    carSprite.x = u.x;
                    carSprite.y = u.y;
                    carSprite.scale.x = 4.382353;
                    carSprite.scale.y = 4.382353;
                    carSprite.id = u.id;
                    carSprite.rotation = (u.angle - (Math.PI/2));
                    
                    carSprite.launchAnimation = () =>{
                        
                        carSprite.anim = new PIXI.extras.AnimatedSprite(this.animationArray);
                        carSprite.anim.anchor.set(0.5,-0.37);
                        carSprite.anim.x = 0;
                        carSprite.anim.y = 0;
                        carSprite.anim.animationSpeed = 0.15;
                        carSprite.anim.loop = false;
                        carSprite.anim.onComplete = function (){this.parent.anim = null; this.parent.removeChild(this); };
                        carSprite.addChild(carSprite.anim);
                        carSprite.anim.play();
                    };

                    

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
                        var pos = carSprite.getGlobalPosition();
                        var mouseX = this.mouse.x + this.mPlusX; var mouseY = this.mouse.y + this.mPlusY;
                      //  socket.emit("launch",{x:carSprite.x,y:carSprite.y,mX:mouseX,mY:mouseY}); //launching car
                        this.launchedCar = {id:carSprite.id, x:pos.x,y:pos.y,mX:mouseX - this.mPlusX,mY:mouseY - this.mPlusY};
            
                    });



                    this.OnScreen.addChild(carSprite);
                    this.screenSprites[u.id] = carSprite;
                    updatedChildArray.push(u.id);
                    amount++;
                    ayy++;

                  

                 

                    var style = new PIXI.TextStyle({
                        fontFamily: 'Arial',
                        fontSize: 25,
                       
                        
                        fill: ['#ffffff'], // gradient
                        
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
                      
                        this.stage.addChild(playerName);
                        //this.stage.setChildIndex(this.tilingSprite,0);
                    }

                    //this.OnScreen.setChildIndex(this.car ,size - 1);

                }
               // console.log(ayy);

            });

            environment.forEach((sprites) => {
                
                if(this.screenSprites.hasOwnProperty(sprites.id)){
                    //Tween
                   
               //     createjs.Tween.get(this.screenSprites[sprites.id]).to({x:sprites.x,y:sprites.y},timeDelta);
                    
                    this.screenSprites[sprites.id].x = sprites.x ;
                    this.screenSprites[sprites.id].y = sprites.y ;
                    updatedChildArray.push(sprites.id);
                   // this.OnScreen.setChildIndex(this.screenSprites[sprites.id] ,this.OnScreen.children.length - 1);
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
                  //  console.log("MANA DRAWN" + sprites.id);
                    manaSprite.drawCircle(0,0,10);
                    manaSprite.endFill();
                    this.OnScreen.addChild(manaSprite);
                  
                    this.screenSprites[sprites.id] = manaSprite;
                    updatedChildArray.push(sprites.id);
                    //this.OnScreen.setChildIndex(this.screenSprites[sprites.id] ,this.OnScreen.children.length - 1);
                    amount++;
                }
            });



            

         //   console.log(this.OnScreen.children.length);
            amount = this.OnScreen.children.length - amount;
           let difference = this.OnScreen.children.filter(x => !updatedChildArray.includes(x.id));

           difference.forEach((trash)=>{

            if(trash.nameLabel != undefined)
                this.stage.removeChild(trash.nameLabel);

            this.stage.removeChild(trash);
            delete this.screenSprites[trash.id];
            this.OnScreen.removeChild(trash);

           });
         
           

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
      //event.preventDefault();
    };
  
    
    key.upHandler = event => {
      if (event.keyCode === key.code) {
       key.release();
       key.down = false;
       
      }
      //event.preventDefault();
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
        //console.log("HEYO");

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
