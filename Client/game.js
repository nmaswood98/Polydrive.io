/*jshint esversion: 6 */



var Game = {
    
     mPlusX : 0,
     mPlusY : 0,
    amountFollowing : 0,

    removeMana: function(){
        
        Object.keys(this.screenSprites).forEach((key)=>{
            let sprite = this.screenSprites[key];
            if(sprite.isMana){
                this.stage.removeChild(sprite);
                this.OnScreen.removeChild(sprite);
                delete this.screenSprites[key];
            }
        });

    },
    
    init: function(primus,application,name,carIndex){
        this.primus = primus;
        this.setSocket = (p) => {
            this.primus = p;
        };
        //console.log(carIndex);
        this.carIndex = carIndex;
        this.followerCount = 0;
        this.manaCount = 0;
        this.app = application;
        this.worldX = 7500;
        this.worldY = 5000;
        this.zoomScale = 1;
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



        
        viewport.onMax = true;
        viewport.zoomedWithMouseWheel = false;
        viewport.addChild(this.stage);
        this.app.stage.addChild(viewport);
        //viewport plugins for zooming
        viewport.wheel({center:{x:this.app.screen.width/2,y:this.app.screen.height/2}});
        viewport.clampZoom({maxWidth: this.app.renderer.width * 1,maxHeight: this.app.renderer.height * 1});
        var hit = false;
        viewport.on("snap-zoom-start",(info)=>{
           // console.log("HEY MAN WHAT IS UP ");
            viewport.onMax = false;
            hit = true;
        
        });

        this.zoomTo = (amount,immediatly)=>{ //Scales canvas height and width based on amount of carss you have
            
            this.zoomScale = 0.009467213*amount + 1.090164;
            if(amount < 15){
                this.zoomScale = 1;
            }
            else if (amount >=200)
            this.zoomScale = 0.005*amount + 2;
            
            
            if(immediatly)
                viewport.snapZoom({width: this.app.renderer.width * this.zoomScale,height: this.app.renderer.height * this.zoomScale,center:{x:this.app.screen.width/2,y:this.app.screen.height/2}});
       
                viewport.clampZoom({maxWidth: this.app.renderer.width * this.zoomScale,maxHeight: this.app.renderer.height * this.zoomScale});
            };
        
           

       this.consoleZoom = ()=>{
           
          //  console.log(viewport.hitArea);


       };

        this.hide = ()=>{
            this.removeMana();
            viewport.visible = false;
            this.lBoard.visible = false;
            this.sLabel.visible = false;
            this.garageLabel.visible = false;
           
           // console.log(this);    
        }

        this.show = ()=>{
            viewport.visible = true;
            this.lBoard.visible = true;
            this.sLabel.visible = true;
            this.garageLabel.visible = true;
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
      //  this.app.renderer.plugins.interaction.supportsTouchEvents = true;
      // this.app.renderer.plugins.interaction.autoPreventDefault = false
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
        this.garageLabel = GarageLabel.create(this.app);
       // this.lBoard.updateLeaderboard([{name:"nabhan",score:231}]);
       // this.lBoard.updateLeaderboard([3,'nabhan',1,"maswood",1,"pablo",1,]);
        //




        let notificaitonText = new PIXI.Text('+10 Car Captured',{fontFamily : 'Arial', fontSize: 85, fill : 0xffffff , align : 'center'});
        
        notificaitonText.scoreCount = 0;
        notificaitonText.text = "+" + notificaitonText.scoreCount + " Car Captured";
        notificaitonText.alpha = 0;
        notificaitonText.anchor.set(0.5);
        notificaitonText.x = this.app.screen.width / 2;
        notificaitonText.y = this.app.screen.height / 9;

        this.app.stage.addChild(notificaitonText);

        this.app.notify = (message)=>{
            
            if( typeof message === 'number'){
                notificaitonText.scoreCount += message;

                if(notificaitonText.scoreCount === 1)
                    notificaitonText.text =  notificaitonText.scoreCount + " Car Captured";
                else
                    notificaitonText.text =  notificaitonText.scoreCount + " Cars Captured";

            }else{
                notificaitonText.text = message;
            }

            if(notificaitonText.alpha === 1){
                TweenMax.to(notificaitonText,1,{
                    delay:2,
                    ease:Linear.easeNone,
                    pixi:{alpha:0},
                    overwrite:"all",
                    onComplete: ()=>{notificaitonText.scoreCount = 0;}
                });

                return;
            }

            TweenMax.to(notificaitonText,0.5,{
                delay:0,
                ease:Linear.easeNone,
                pixi:{alpha:1},
                overwrite:"all",
                onComplete: ()=>{
                    TweenMax.to(notificaitonText,1,{
                        delay:4,
                        ease:Linear.easeNone,
                        pixi:{alpha:0},
                        overwrite:"all",
                        onComplete: ()=>{notificaitonText.scoreCount = 0;}
                    });
                }
            });


        };

        this.tilingSprite = new PIXI.extras.TilingSprite(
            this.spriteSheet["TextureBackground.png"],
            7500,
            5000
        );
        this.stage.addChild(this.tilingSprite);
        
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

            this.tilingSprite.width = this.worldX;
            this.tilingSprite.height = this.worldY;
        };


        this.stage.setChildIndex(this.tilingSprite,0);
        var barSize = this.app.screen.width/1.5;
        var barSprite = CoolDownBar.create(this.app,this.app.screen.width/2 - barSize/2,this.app.screen.height - 20 ,barSize,10);
        this.barSpriteState = barSprite.barState;
       // this.app.renderer.plugins.interaction.on('pointerdown', barSprite.changeActive.bind(null,true));
      //  this.app.renderer.plugins.interaction.on('pointerup', barSprite.changeActive.bind(null,false));
        this.app.ticker.add(barSprite.update);


        this.app.renderer.plugins.interaction.on('mousedown', () => {
            if (!this.starting)
                return;

            if (this.rClick)
                this.rClick = false;

            this.lClick = true;
            barSprite.changeActive(true);
            // console.log(this.lClick);
        });

        this.app.renderer.plugins.interaction.on('rightdown', () => {
            if (!this.starting)
                return;
            if (this.lClick)
                this.lClick = false;

            this.rClick = true;
            barSprite.changeActive(true);
            // console.log(this.lClick);
        });

        this.app.renderer.plugins.interaction.on('rightup', () => {
            if (!this.starting)
                return;
            this.rClick = false;
            this.lClick = false;
            barSprite.changeActive(false);
            // console.log(this.lClick);
        });



        this.app.renderer.plugins.interaction.on('mouseup',  () => {
            this.lClick = false;
            this.rClick = false;
            barSprite.changeActive(false);
          //  console.log(this.lClick);
        });



        this.app.renderer.backgroundColor = 0xffffff;




        this.build();
          
        this.intialized = true;



        this.updateSize =  (width,height) =>{
           // console.log(this.app.screen.width);
            viewport.resize(width,height);
            viewport.wheel({center:{x:this.app.screen.width/2,y:this.app.screen.height/2}});
            viewport.clampZoom({maxWidth: this.app.renderer.width * this.zoomScale,maxHeight: this.app.renderer.height * this.zoomScale});
            viewport.moveCenter({x:this.app.screen.width/2,y:this.app.screen.height/2});
            viewport.snapZoom({width: this.app.renderer.width * this.zoomScale,height: this.app.renderer.height * this.zoomScale,center:{x:this.app.screen.width/2,y:this.app.screen.height/2},time: 1});
        
        
            notificaitonText.x = this.app.screen.width / 2;
            notificaitonText.y = this.app.screen.height / 9;

            this.lBoard.updatePosition();
            this.sLabel.updatePosition();
            this.garageLabel.updatePosition();
        
        };






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
            //console.log(index);
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
      //  this.consoleZoom();
     // console.log(this.followerCount);
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


      if (this.barSpriteState.barWasFull === true) { //Detects the cooldown and prevents. WIll add server check for this later 
          this.rClick = false;
          this.lClick = false;
      }

      if (this.starting)
          if (this.starting && this.car.id != -1) {
              if (this.checkDistance(mouseX, mouseY) && this.mouse.x != 0 && !this.aKey.down) {
                  // this.primus.write(["playerTick",this.carrotation,false,this.lClick,this.rClick,this.launchedCar]);
                  this.primus.write(["playerTick", this.carrotation, false, this.rClick, this.lClick, this.launchedCar]);
                  this.launchedCar = null;
              }
              else {

                  this.primus.write(["playerTick", this.carrotation, true, this.rClick, this.lClick, this.launchedCar]);
                  this.launchedCar = null;
              }
          }
   
  // console.log(this.app.renderer);
  if(this.starting)
    this.setStage(this.car.x - (this.app.renderer.width/2 ), this.car.y - (this.app.renderer.height/2),this.car.x - (this.app.screen.width/2 ), this.car.y - (this.app.screen.height/2));
      //  console.log(this.car.rotation);
      

    if(this.car.x > this.worldX + 100 || this.car.y > this.worldY + 100 || this.car.x < -100 || this.car.y < -100 ){
        
        this.app.renderer.backgroundColor = 0xfc0000;
    }
    else{
        this.app.renderer.backgroundColor = 0xffffff;
    }
    
  },

  

  draw: function(snapShot,timeDelta) {
      
    //console.log(snapShot);
            /* snapShot is an array of the world given by the server. A cursor is used to iterate over the array and draw it on screen. Item is the element which the cursor points to. 
                If item is -1 then the next 6 elemnts including item is the player Information so we process and add 6 to the cursor then continue the loop.
                If item is a string then we know that it's a enemy player in the game and the next 6 elments including item is the info to draw the enemyPlayer, Process then, cursor +6
                If item is a number then we know its a car follower which is associated to the most recent enemy player or the player. The next 4 elements are the information. Process and
                then move cursor + 4; 
            */

           let amount = 0;
           
           let size = this.OnScreen.children.length; 
           let updatedChildArray = [];
           let lastUpdatedIsPlayer = false;
           let cursor = 1;
           let carIndex = 0;
           while(cursor < snapShot.length){
               let item = snapShot[cursor];
           
               if(item === -1){ //[-1,manaCount,followerCount,playerX,playerY,angle]
               //Player 

                   carIndex = this.carIndex;
                   

                   if(this.manaCount != snapShot[cursor +1]){

                        if(snapShot[cursor+2] != this.followerCount){
                            
                            if(snapShot[cursor+2] > this.followerCount)
                                this.app.notify((snapShot[cursor+2] - this.followerCount));
                            else{
                                
                               
                            }
                            this.followerCount = snapShot[cursor+2];


                            this.zoomTo(snapShot[cursor + 2],true); ///ERROR HERE 

                        }

                        
                        this.manaCount = snapShot[cursor+1];
                        this.sLabel.updateScoreLabel(this.manaCount);
                        this.garageLabel.updateGarageLabel(snapShot[cursor + 6]);
                        
                   }
                   

                   

                
                   //  console.log([snapShot[cursor],snapShot[cursor + 1],snapShot[cursor + 2],snapShot[cursor + 3],snapShot[cursor + 4],snapShot[cursor + 5]]);
                   TweenMax.to(this.car,timeDelta/1000,{
                       ease:Linear.ease,
                       pixi:{x:snapShot[cursor+3],y:snapShot[cursor+4]},
                       directionalRotation:{
                           rotation:  (snapShot[cursor+5] - (Math.PI/2)) + "_short",
                           useRadians: true
                       },
                       overwrite:"all"
                   });
                   
                   lastUpdatedIsPlayer = true;
                   cursor = cursor + 7;
                   continue;
               }
               else if (item === -2){ //[-2,manaId,X,Y]
               //mana
               if(this.screenSprites.hasOwnProperty("mana" + snapShot[cursor+1])){

                if(snapShot[cursor+2] === -1){
                 //   console.log("REMOVING MANA");
                    this.stage.removeChild(this.screenSprites["mana" + snapShot[cursor+1]]);
                    this.OnScreen.removeChild(this.screenSprites["mana" + snapShot[cursor+1]]);
                    delete this.screenSprites["mana" + snapShot[cursor+1]];
                   
                }else{
                   
                   this.screenSprites["mana" + snapShot[cursor+1]].x =  snapShot[cursor+2];
                   this.screenSprites["mana" + snapShot[cursor+1]].y = snapShot[cursor+3];
                   updatedChildArray.push("mana" + snapShot[cursor+1]);
                }

               }
               else{
                  // console.log([]);


                   var manaSprite = new PIXI.Graphics();
                    manaSprite.isMana = true;
                    manaSprite.id = "mana" + snapShot[cursor+1];
                    manaSprite.x =  snapShot[cursor+2] ;
                    manaSprite.y =  snapShot[cursor+3] ;
                    manaSprite.beginFill(this.randomColor());
                    manaSprite.drawCircle(0,0,10);
                    manaSprite.endFill();

                    this.OnScreen.addChild(manaSprite);
                    this.screenSprites["mana" + snapShot[cursor+1]] = manaSprite;
                    updatedChildArray.push("mana" + snapShot[cursor+1]);
                    amount++;

                  
               }
                   cursor = cursor + 4;
                   continue;
               }
               else if(typeof item === 'string' || typeof item === 'number'){ //[name,X,Y,angle,carIndex]  //[id,X,Y,angle,isLaunching]
               //EnemyPlayer 
               //console.log(item);
                   if(this.screenSprites.hasOwnProperty( item )){
                    
                       TweenMax.to(this.screenSprites[item],timeDelta/1000,{
                           ease:Linear.easeNone,
                           pixi:{x:snapShot[cursor+1],y:snapShot[cursor+2]},
                           overwrite:"all",
                           directionalRotation:{
                               rotation: (snapShot[cursor+3]- (Math.PI/2)) + "_short",
                               useRadians: true
                           }
                       });

                       if( typeof item === 'string'){
                        lastUpdatedIsPlayer = false;
                           carIndex = snapShot[cursor + 4] - 1;
                           TweenMax.to(this.screenSprites[item].nameLabel,timeDelta/1000,{
                               ease:Linear.easeNone,
                               pixi:{x:snapShot[cursor+1],y:snapShot[cursor+2] - 110},
                               overwrite:"all"
                           });
                       }
                       else{
                            let potentialCarIndex = snapShot[cursor+4] % 100;
                            if(potentialCarIndex > 0){ //Increase all carindexes by 1
                                carIndex = potentialCarIndex - 1;
                            }
                          //  console.log(snapShot[cursor+4]);
                           if(snapShot[cursor+4] >= 100){
                              
                               if(this.screenSprites[item].anim == null && !(this.screenSprites[item].isLaunching) ){
                                   this.screenSprites[item].isLaunching = true;
                                   this.screenSprites[item].launchAnimation();
                               }
                           }
                           else{
                               this.screenSprites[item].isLaunching = false;
                           }

                           
                       }

                       amount++;
                       updatedChildArray.push(item);
                      // createjs.Tween.get(this.screenSprites[u.id].nameLabel).to({x:u.x,y:u.y - 110},timeDelta);
                   }
                   else{
                    
                   

                       let potentialCarIndex = snapShot[cursor+4] % 100;
                            if(potentialCarIndex > 0){ //Increase all carindexes by 1
                                carIndex = potentialCarIndex - 1;
                            }

                
                       let carSprite = new PIXI.Sprite(this.spriteSheet[carIndex]);
                       carSprite.interactive = false;
                       carSprite.anchor.set(0.5,0.5);
                       carSprite.scale.x = 4.382353; carSprite.scale.y = 4.382353;
                       carSprite.x = snapShot[cursor+1];
                       carSprite.y = snapShot[cursor+2];
                       
                       carSprite.id = item;
                       carSprite.rotation = (snapShot[cursor+3] - (Math.PI/2));

                       this.OnScreen.addChild(carSprite);
                       this.screenSprites[item] = carSprite;
                       updatedChildArray.push(item);
                       amount++;

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

           
                      if( typeof item === 'string'){
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

                           var playerName = new PIXI.Text(item,style); //Change to rotation
                           playerName.x = carSprite.x;
                           playerName.y = carSprite.y  - 110;
                           carSprite.nameLabel = playerName;
                           this.stage.addChild(playerName);
                           lastUpdatedIsPlayer = false;
                      }
                      else if (lastUpdatedIsPlayer){
                      //  console.log(carSprite.id);
                           carSprite.interactive = true;
                           carSprite.on('pointerdown', () => {
                               this.line.car = carSprite;
                               this.line.color = this.randomColor();
                               carSprite.alpha = 0.5;
                           });
                           carSprite.on('pointerup', ()=>{
                               this.line.car = null;
                               carSprite.alpha = 1;
                           });
                          
                           carSprite.on('pointerupoutside', (a)=>{
                               
                               this.line.car = null;
                               carSprite.alpha = 1;
                               var pos = carSprite.getGlobalPosition();
                               var mouseX = this.mouse.x + this.mPlusX, mouseY = this.mouse.y + this.mPlusY;
                               this.launchedCar = {id:carSprite.id, x:pos.x,y:pos.y,mX:mouseX - this.mPlusX,mY:mouseY - this.mPlusY};
                               
           
                           });
                           //console.log(carSprite);
                      }

                   }
                   
                   cursor = cursor + 5;
                   continue;
               }
               else{

               }
               
           } ///while end

           amount = this.OnScreen.children.length - amount;
           let difference = this.OnScreen.children.filter(x => !updatedChildArray.includes(x.id));

           difference.forEach((trash)=>{

                if(trash.isMana)
                    return;

               if(trash.nameLabel !== undefined)
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

