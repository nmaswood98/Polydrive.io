/*jshint esversion: 6 */
//var PIXI = require('pixi.js');



var Menu = {

    app: new PIXI.Application(
        
        document.documentElement.clientWidth
        , document.documentElement.clientHeight
        , { backgroundColor: 0x282525, autoResize: true }
    
    ),
        

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
     
        

    init: function () {
        
        this.primus = null;
        this.serverIP = null;
        //connect to server
        
       //connect to server
        this.screenSprites = {};
        this.manaSprites = {};
        this.OnScreen = new PIXI.Container();

        const draw = (snapShot)=>{

        };

        
        this.app.renderer.backgroundColor = 0xffffff;


        
        TweenMax.ticker.fps(60);
        this.app.mouse = this.app.renderer.plugins.interaction.mouse.global;
        var poop = 1 + 'a';
        //console.log(typeof poop);
        this.stage = new PIXI.Container();
        this.app.stage.addChild(this.stage);
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        this.app.renderer.resize(this.app.screen.width, this.app.screen.height);
        this.stage.tint = 0xff0000 ;

     this.app.renderer.view.style.width = this.app.screen.width/2 + "px";
     this.app.renderer.view.style.height = this.app.screen.height/2 + "px";
        //console.log( this.app.screen.width);
      //  this.app.renderer.resize(this.app.screen.width/2, this.app.screen.height/2);
       
        //this.app.roundPixels = true;
        var size = [16, 9];
        var ratio = size[0] / size[1];  

        //console.log(this.app.screen.width); 



        this.viewport = this.stage;

       // var renderer = PIXI.autoDetectRenderer(size[0], size[1], null);
        
        document.body.appendChild(this.app.view);
        //console.log(this);
        var that = this;
        var loadGame = (a)=>{
            that.setup(a).call(that);

        }
        
        PIXI.loader
        .add('/polydriveSpriteSheet.json')
        .load(this.setup);
        var that = this;
       
        //this.setup(PIXI.loader);
        //console.log(PIXI.loader);
    },

    setup: (a) =>  {
     
        //primus.write(["spawn"]);

       var spriteSheet = a.resources["/polydriveSpriteSheet.json"].textures; 
        var that = this.menu;
        that.cCarIndex = Math.floor(Math.random() * 39);


        that.app.view.style.position = 'absolute';
        that.app.view.style.left = '50%';
        that.app.view.style.top = '50%';
        that.app.view.style.transform = 'translate3d( -50%, -50%, 0 )';
        that.app.view.style.zIndex = -1;
        that.mouse = that.app.renderer.plugins.interaction.mouse.global;
        
        var textbox = document.getElementById("nameField");
        var regionList = document.getElementById("regionList");

        


        

        that.hideMenu = function(){
            textbox.style.display = "none";
            regionList.style.display = "none";
            that.stage.visible = false;
           
    
        };
    
        that.showMenu = function(){
            that.stage.visible = true;
            //console.log(textbox);
            textbox.style.display = "";
            regionList.style.display = "";
        };





        that.manager = Object.create(Manager);
        //console.log(that.cCarIndex);
        that.manager.init(that.serverIP,that.app,textbox.value,that);
        that.manager.app.ticker.add(function(delta){that.manager.ticker(delta);});


        regionList.onchange = function(){

        fetch("/GameServer/" + regionList.value)
        .then((response) => {
            
          return response.text();
        })
        .then((serverIP) => {
            
            if(serverIP != "0")
                that.manager.createSocket(serverIP);
        });

        };

        fetch("/GameServer/" + regionList.value)
        .then((response) => {
            
          return response.text();
        })
        .then((serverIP) => {
            
            if(serverIP != "0")
                that.manager.createSocket(serverIP);
        });
        
        that.tilingSprite = new PIXI.extras.TilingSprite(
            spriteSheet["TextureBackground.png"],
            that.app.screen.width * 3,
            that.app.screen.height * 3
        );
        that.tilingSprite.x = -20;
        that.tilingSprite.y = -10;
        that.viewport.addChild(that.tilingSprite);
        
        that.viewport.setChildIndex(that.tilingSprite,0);


        document.documentElement.style.overflow = 'hidden';  // firefox, chrome
        document.body.scroll = "no";

        var startButton = new PIXI.Sprite(spriteSheet["Play.png"]);
        var logo =new PIXI.Sprite(spriteSheet["Polydrivelogo.png"]);

        startButton.anchor.set(0.5);
        startButton.x = that.app.screen.width / 2;
        startButton.y = that.app.screen.height / 2;
        startButton.scale.x *= 1.8;
        startButton.scale.y *= 1.8;
        startButton.interactive = true;
        startButton.buttonMode = true;
       
        

        startButton.on('pointerdown', ()=>{
   


            if(!that.manager){
                
                if(that.serverIP != null){
                    that.manager = Object.create(Manager);
                    //console.log(that.cCarIndex);
                    that.manager.init(that.serverIP,that.app,textbox.value,that.cCarIndex,that);
                    that.manager.app.ticker.add(function(delta){that.manager.ticker(delta);});
                    that.manager.spawn(textbox.value,that.cCarIndex);
                }
                
            }
            else{
                that.manager.spawn(textbox.value,that.cCarIndex);
                
            }

        });




        that.viewport.addChild(startButton);

        var style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 150,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#30f2ae', '#31abed'], // gradient
            stroke: '#56f12f',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440
        });


        var basicText = new PIXI.Text('Polydrive.io',style);
        logo.anchor.set(0.5);
      //  logo.scale.set(0.5);
        logo.x = that.app.screen.width / 2;
        logo.y = that.app.screen.height/4.75;

        that.viewport.addChild(logo);


        that.line = new PIXI.Graphics();

        that.line.lineStyle(2, 0x33FF00);
        that.line.moveTo(that.app.screen.width / 2,that.app.screen.height / 2);
        that.line.lineTo(600, 300);

       // this.app.stage.addChild(this.line);



        for(var i = 0; i < 20; i++){

            var manaSprite = new PIXI.Graphics();
            // manaSprite.anchor.set(0.5,0.5);
             
             manaSprite.x = Math.floor(Math.random() * that.app.screen.width );
             manaSprite.y = Math.floor(Math.random() * that.app.screen.height);
             manaSprite.beginFill(that.randomColor());
             manaSprite.drawCircle(0,0,10);
             manaSprite.endFill();
             that.viewport.addChild(manaSprite);
             
        }
        var animationArray = [];
        
        a.resources["/polydriveSpriteSheet.json"].data.animations.nitro.forEach(element => {
            animationArray.push(spriteSheet[element]);
        });   

    
       // let textures = PIXI.loader.resources["car12_blue.png"].texture;
      // //console.log(a.resources["/polydriveSpriteSheet.json"].data.animations.nitro);
      
        var carSprite = new PIXI.Sprite(spriteSheet[that.cCarIndex]);
        //var carSprite = new PIXI.extras.AnimatedSprite()
        carSprite.interactive = false;
        carSprite.anchor.set(0.5,0.5);
        //carSprite.updated = true;
        carSprite.x = 1500;
        carSprite.y = 1000;
       // carSprite.id = u.id;
        carSprite.rotation = Math.PI/4;
        carSprite.scale.x = 4.382353;
        //carSprite.scale.x = 4.382353;
        carSprite.scale.y = 4.382353;
       // carSprite.tint = 0xe100ff;
        that.viewport.addChild(carSprite);


        var createAnimationAt = (x,y) =>{
            var nitroSprite = new PIXI.extras.AnimatedSprite(animationArray);
            nitroSprite.anchor.set(0.5,-0.37);
            nitroSprite.x = x;
            nitroSprite.y = y;
           // nitroSprite.rotation = 0;
            //nitroSprite.scale.set(4.382353);
            nitroSprite.animationSpeed = 0.18;
            nitroSprite.loop = true;
           // nitroSprite.onComplete = function (){this.parent.removeChild(this);};
           carSprite.addChild(nitroSprite);
            nitroSprite.play();
            }
    
            var poop =  createAnimationAt(0,0);

       // createjs.Tween.get(logo).to({x:100,y:100},3000);
       // createjs.Ticker.framerate = 60;



    that.app.ticker.add(delta => {that.ticker(delta);});


    
   
    var carChangeText = new PIXI.Text('Change Car', {
        fontFamily: 'Tahoma',
        fontSize: 35,
        fill: 'white',
        strokeThickness: 8,
        lineJoin: "round",
        align: 'left'
    }); 
    carChangeText.interactive = true;
    carChangeText.x = 20;
    carChangeText.y = that.app.screen.height - carChangeText.height - 20;

    that.stage.addChild(carChangeText);
    //console.log(textbox.style.display);
    carChangeText.on("pointerdown",function(){
        
        if(carChangeText.carpicker === undefined)
            carChangeText.carpicker = CarPicker.create(that.app);
        else
            carChangeText.carpicker.visible = true;

        textbox.style.display = "none";
        regionList.style.display = "none";
        var blurFilter2 = new PIXI.filters.BlurFilter();
        blurFilter2.resolution = 0.5;
        //that.viewport.filterArea = new PIXI.Rectangle(0, 0, that.app.screen.width,that.app.screen.height);
        blurFilter2.blur = 0;
      TweenMax.to(blurFilter2 ,0.1,{
            ease:Linear.easeNone,
            blur:8
        });

        TweenMax.to(carChangeText.carpicker ,0.1,{
            ease:Linear.easeNone,
            pixi:{alpha:1}
        });
        //blurFilter2.blur = 6;
        that.viewport.filters = [blurFilter2]; 
        that.viewport.interactive = true;

    });

    that.viewport.on("pointerdown",function(){
        
      //  blurFilter2.blur = 0;
        //blurFilter2.autoFit = true;
      //that.viewport.filterArea = new PIXI.Rectangle(0, 0, 100,100);
      var blurFilter2 = new PIXI.filters.BlurFilter();
        blurFilter2.resolution = 0.5;
        that.viewport.filters = [blurFilter2]; 
        //carChangeText.carpicker.alpha = 0;
        
        that.cCarIndex = carChangeText.carpicker.getCarIndex();
        //console.log(that.cCarIndex );
        carSprite.texture = spriteSheet[that.cCarIndex];
        that.viewport.interactive = false;

        TweenMax.to(blurFilter2 ,0.1,{
            ease:Linear.easeNone,
            blur:0
        });

        TweenMax.to(carChangeText.carpicker ,0.1,{
            ease:Linear.easeNone,
            pixi:{alpha:0},
            onComplete:function(){carChangeText.carpicker.visible = false;textbox.style.display = ""; regionList.style.display = "";}
        });
        textbox.style.display = "";
        regionList.style.display = "";

       
        
    });



    let helperText = new PIXI.Text('+10 Car Captured',{fontFamily : 'Tahoma', fontSize: 40,fontWeight: 'lighter', fill : 0xffffff , align : 'center'});
    helperText.alpha = 0;
    helperText.anchor.set(0.5);
    helperText.x = that.app.screen.width / 2;
    helperText.y = that.app.screen.height / 3.46; //3.46
    helperText.repeat = false;
    that.viewport.addChild(helperText);

    helperText.stop = function(){
        this.repeat = false;
    };

    helperText.switchBetween = (message)=>{
        helperText.repeat = true;
        let displayAndDisappear = (index,transitionTime,delayTime,delayBetweenTime) =>{
            helperText.text = message[index];
            //console.log(message[index]);
        TweenMax.to(helperText,transitionTime,{
            delay:delayBetweenTime,
            ease:Linear.easeNone,
            pixi:{alpha:1},
            overwrite:"all",
            onComplete: ()=>{
                TweenMax.to(helperText,transitionTime,{
                    delay:delayTime,
                    ease:Linear.easeNone,
                    pixi:{alpha:0},
                    overwrite:"all",
                    onComplete: ()=>{

                        if(helperText.repeat){
                            if(index < (message.length - 1))
                                displayAndDisappear(index + 1,0.3,2,0);
                            else
                                displayAndDisappear(0,0.3,2,0);
                        }

                    }
                });
            }
        });
    };

    displayAndDisappear(0,0.3,4,1);

    };

    helperText.switchBetween([
        "Capture cars by driving into them!",
        "Avoid the front of Other Cars!",
        "Click to go faster!",
        "Right click makes your captured cars go faster!",
        "Click and drag your captured cars for a speed boost!",
        "Hold D to lock direction or F to stop moving!"
    ]);


    that.updateSize = function(){
        startButton.x = that.app.screen.width / 2;
        startButton.y = that.app.screen.height / 2;

        logo.x = that.app.screen.width / 2;
        logo.y = that.app.screen.height/4.75;

        carChangeText.x = 20;
        carChangeText.y = that.app.screen.height - carChangeText.height - 20;

        helperText.x = that.app.screen.width / 2;
        helperText.y = that.app.screen.height / 3.46; //3.46
       
        if(carChangeText.carpicker !== undefined)
            carChangeText.carpicker.updatePosition();
    };



    },

    createLeaderboard: function(){


        
    },

    

    ticker: function(delta){
        
   
    }

};

var ScoreLabel = {
    init: function(application){
        this.app = application;
        
        this.scoreText = new PIXI.Text('Score: 0', {
            fontFamily: 'Tahoma',
            fontSize: 35,
            fill: 'white',
            strokeThickness: 8,
            lineJoin: "round",
            align: 'left'
        }); 

        this.scoreText.x = 20;
        this.scoreText.y = this.app.screen.height - this.scoreText.height - 20;

        this.app.stage.addChild(this.scoreText);

        this.scoreText.updateScoreLabel = function(score){
            this.text = 'Score: ' + score;
        };

        



    },

    create: function(application){
        var instance = Object.create(this);
        instance.init(application);

        instance.scoreText.updatePosition = function(){
            instance.scoreText.x = 20;
            instance.scoreText.y = application.screen.height - instance.scoreText.height - 20;
        };

        return instance.scoreText;
        
    }


};

var GarageLabel = {
    init: function(application){
        this.app = application;
        
        this.garageText = new PIXI.Text('Garage: 0', {
            fontFamily: 'Tahoma',
            fontSize: 35,
            fill: 'white',
            strokeThickness: 8,
            lineJoin: "round",
            align: 'left'
        }); 

        this.garageText.x = 20;
        this.garageText.y = this.garageText.height - 20;

        this.app.stage.addChild(this.garageText);

        this.garageText.updateGarageLabel = function(score){
            this.text = 'Garage: ' + score;
        };

        



    },

    create: function(application){
        var instance = Object.create(this);
        instance.init(application);
        instance.garageText.updatePosition = function(){
            instance.garageText.x = 20;
            instance.garageText.y = instance.garageText.height - 20;
        };
        return instance.garageText;

    }


};


//Creates Leaderboard for the game. Can be updated and added on to.
var Leaderboard = {
    init: function(application){

        this.board = new PIXI.Container();
       // this.board.scale = 1;
        var count = 0; //amount of players on the leaderboard

        //Create Title for the Leaderboard place on the top right of screen
        var leaderBoardTitle = new PIXI.Text('Leaderboard' , {
            fontFamily: 'Tahoma',
            fontSize: 40,
            fill: 'white',
            fontWeight: 'bold',
            strokeThickness: 8,
            lineJoin: "round",
            align: 'center'
        });
        leaderBoardTitle.anchor.set(0.5);
        leaderBoardTitle.x = 0 ;
        leaderBoardTitle.y = 40 ;
        //

        

        //Name list for LeaderBoard
       var playerNames = new PIXI.Text('' , {
            fontFamily: 'Tahoma',
            fontSize: 35,
            fill: 'white',
            strokeThickness: 8,
            lineJoin: "round",
            align: 'left'
        });
       
        playerNames.x = -180;
        playerNames.y = 80;
    
       
        //
        //Score for each Player on the leaderboard
        var playerScores = new PIXI.Text('' , {
            fontFamily: 'Tahoma',
            fontSize: 35,
            fill: 'white',
            strokeThickness: 8,
            lineJoin: "round",
            align: 'center'
        });
       // //console.log(playerScores.width);
       playerScores.anchor.set(1,0);
        playerScores.x = 180;
        playerScores.y = 80 ;
       
        //playerScores.zOrder = 100;
        this.board.addChild(leaderBoardTitle,playerNames,playerScores);

        this.board.addPlayer = function(player){//adds 1 player onto the leaderboard at the end
            count++;
            playerNames.text += count + ". " +  player.name + "\n ";
            playerScores.text += player.score + "\n ";
            

        };
     //   //console.log(this.app.stage.width);
     this.board.updateLeaderboard = function(data){ //places entire array of players onto the leaderboard replacing the current leaderboard
            count = 0;
            playerNames.text = "";
            playerScores.text = "";
            for(let i = 1; i < (data.length - 1); i += 2){
                this.addPlayer({name:data[i],score:data[i+1]});         
            }
        };

    },

    create: function(application){
        var instance = Object.create(this);
        instance.init(application);
        application.stage.addChild(instance.board);
        instance.board.x = application.screen.width - instance.board.width/1.7;
        instance.board.y = instance.board.height/6;

        instance.board.updatePosition = function(){
            instance.board.x = application.screen.width - instance.board.width/1.7;
            instance.board.y = instance.board.height/6;
        };

        return instance.board;
    }

};

var ModalView = {
    init: function(application){
        
        var spriteSheet = PIXI.loader.resources["/polydriveSpriteSheet.json"].textures;
        var animationArray = [];
        
        PIXI.loader.resources["/polydriveSpriteSheet.json"].data.animations.nitro.forEach(element => {
            animationArray.push(spriteSheet[element]);
        }); 
        this.stage = new PIXI.Container();
        //this.stage.interactiveChildren = false;
        //this.stage.visible = false;
        var gBounds = new PIXI.Graphics();
        graphics.interactive = true;
        graphics.beginFill(0x242121);
        graphics.drawRect(0, 0, application.screen.width/2, application.screen.height/2);
        graphics.endFill();
        //graphics.anchor.set(0.5);
        this.stage.addChild(graphics);

        var title = new PIXI.Text('Car Picker' , {
            fontFamily: 'Tahoma',
            fontSize: 60,
            fill: 'white',
            lineJoin: "round",
            align: 'center'
        });
        title.anchor.set(0.5);
        title.x = graphics.width/2 ;
        title.y = 100 ;
        graphics.addChild(title);

    },

    create: function(application){
        var instance = Object.create(this);
        instance.init(application);
        application.stage.addChild(instance.stage);
       // instance.stage.x = application.screen.width/2;
        instance.stage.pivot.x = -application.screen.width/4;
        instance.stage.pivot.y = -application.screen.height/5;

        instance.stage.updatePosition = function (){
            instance.stage.pivot.x = -application.screen.width/4;
            instance.stage.pivot.y = -application.screen.height/5;
        };

        instance.stage.alpha = 0;
        return instance.stage;
    }
};

var CarPicker = {
    init: function(application){
        
        var spriteSheet = PIXI.loader.resources["/polydriveSpriteSheet.json"].textures;
        var animationArray = [];
        
        PIXI.loader.resources["/polydriveSpriteSheet.json"].data.animations.nitro.forEach(element => {
            animationArray.push(spriteSheet[element]);
        }); 
        this.stage = new PIXI.Container();
        //this.stage.interactiveChildren = false;
        //this.stage.visible = false;
        var graphics = new PIXI.Graphics();
        graphics.interactive = true;
        

        //graphics.anchor.set(0.5);
        this.stage.addChild(graphics);

        var title = new PIXI.Text('Car Picker' , {
            fontFamily: 'Tahoma',
            fontSize: 60,
            fill: 'white',
            lineJoin: "round",
            align: 'center'
        });
        title.anchor.set(0.5);
        graphics.addChild(title);


        var cColor = 0;
        var cCar = 0;
        var carSprite = new PIXI.Sprite(spriteSheet[0]);
        carSprite.interactive = false;
        carSprite.anchor.set(0.5,0.5);
        carSprite.rotation = Math.PI/2;
        carSprite.scale.x = 4.382353 * 2;
     
        carSprite.scale.y = 4.382353 * 2;
        graphics.addChild(carSprite);

        var nitroSprite = new PIXI.extras.AnimatedSprite(animationArray);
        nitroSprite.anchor.set(0.5,-0.37);
        nitroSprite.x = 0;
        nitroSprite.y = 0;
       // nitroSprite.rotation = 0;
        //nitroSprite.scale.set(4.382353);
        nitroSprite.animationSpeed = 0.18;
        nitroSprite.loop = true;
       // nitroSprite.onComplete = function (){this.parent.removeChild(this);};
       carSprite.addChild(nitroSprite);
        nitroSprite.play();

        var arrow = new PIXI.Sprite(spriteSheet["arrow"]);
        arrow.interactive = true;
        arrow.anchor.set(0.5,0.5);
        var limit = Math.min(500,graphics.width/2.7155);
        arrow.scale.set(0.4);
        arrow.rotation = Math.PI;
        graphics.addChild(arrow);

        var arrow2 = new PIXI.Sprite(spriteSheet["arrow"]);
        arrow2.interactive = true;
        arrow2.anchor.set(0.5,0.5);
        arrow2.scale.set(0.4);
        arrow2.rotation = Math.PI * 2;
        graphics.addChild(arrow2);

        arrow2.on('pointerdown',(s)=>{
       
            
            if(cCar != 4){
                cCar++;
                carSprite.texture = spriteSheet[cCar + cColor];
            }
        });
        arrow.on('pointerdown',(s)=>{
            if(cCar != 0){
                cCar--;
                carSprite.texture = spriteSheet[cCar + cColor];
            }
        });

        var colors = new PIXI.Graphics();
        colors.interactive = true;
   

        

        this.stage.updateChildPositions = () =>{
            
            graphics.clear();
            graphics.beginFill(0x242121);
            graphics.drawRect(0, 0, application.screen.width/2, application.screen.height/2);
            graphics.endFill();

            graphics.calculateBounds();
            let gBounds = {width:application.screen.width/2, height:application.screen.height/2  };
           // //console.log(graphics.width/2 + " " + application.screen.width/4 )

            
            limit = Math.min(500,gBounds.width/2.7155);
            title.x = gBounds.width/2 ;
            title.y = 100 ;
            
            carSprite.x =  gBounds.width/2;
            carSprite.y = gBounds.height/2;

            arrow.x = carSprite.x - limit;
            arrow.y = gBounds.height/2;

            arrow2.x = carSprite.x + limit;
            arrow2.y = gBounds.height/2;

            colors.clear();
            colors.lineStyle(0);
            colors.beginFill(0xff0000);
            colors.drawCircle(gBounds.width/9, gBounds.height - 100,30);
            colors.endFill();

            colors.lineStyle(0);
            colors.beginFill(0x8e98f2);
            colors.drawCircle((gBounds.width/9) * 2, gBounds.height - 100,30);
            colors.endFill();

            colors.lineStyle(0);
            colors.beginFill(0xa6f58f);
            colors.drawCircle((gBounds.width/9) * 3, gBounds.height - 100,30);
            colors.endFill();

            colors.lineStyle(0);
            colors.beginFill(0xcc85fc);
            colors.drawCircle((gBounds.width/9) * 4, gBounds.height - 100,30);
            colors.endFill();

            colors.lineStyle(0);
            colors.beginFill(0xf68ada);
            colors.drawCircle((gBounds.width/9) * 5, gBounds.height - 100,30);
            colors.endFill();

            colors.lineStyle(0);
            colors.beginFill(0xa5aa5d);
            colors.drawCircle((gBounds.width/9) * 6, gBounds.height - 100,30);
            colors.endFill();

            colors.lineStyle(0);
            colors.beginFill(0xfcc884);
            colors.drawCircle((gBounds.width/9) * 7, gBounds.height - 100,30);
            colors.endFill();

            colors.lineStyle(0);
            colors.beginFill(0xbe9763);
            colors.drawCircle((gBounds.width/9) * 8, gBounds.height - 100,30);
            colors.endFill();

            colors.on('pointerdown',(s)=>{
            
                var pos = this.stage.pivot.x + application.mouse.x;
                var buff = 30;
               //console.log(pos);
    
               
               
    
                if(pos > (gBounds.width/9) * 8 - buff){
                    //console.log("BROWN");
                    cColor = 35;
                    carSprite.texture = spriteSheet[cCar + cColor];
                }
                    
                else if(pos > (gBounds.width/9) * 7 - buff){
                    //console.log("YELLOW");
                    cColor = 15;
                    carSprite.texture = spriteSheet[cCar + cColor];
                    
                }
                    
                else if(pos > (gBounds.width/9) * 6 - buff){
                    //console.log("ARMYGREEN");
                    cColor = 25;
                    carSprite.texture = spriteSheet[cCar + cColor];
                }
                    
                else if(pos > (gBounds.width/9) * 5 - buff){
                    //console.log("PINK");
                    cColor = 30;
                    carSprite.texture = spriteSheet[cCar + cColor];
                }
                    
                else if(pos > (gBounds.width/9) * 4 - buff){
                    //console.log("PURPLE");
                    cColor = 20;
                    carSprite.texture = spriteSheet[cCar + cColor];
                }
                    
                else if(pos > (gBounds.width/9) * 3 - buff){
                    //console.log("GREEN");
                    cColor = 10;
                    carSprite.texture = spriteSheet[cCar + cColor];
                }
                    
                else if(pos > (gBounds.width/9) * 2 - buff){
                    //console.log("BLUE");
                    cColor = 5;
                    carSprite.texture = spriteSheet[cCar + cColor];
                }
                    
                else if(pos > gBounds.width/9 - buff){
                    //console.log("RED");
                    cColor = 0;
                    carSprite.texture = spriteSheet[cCar + cColor];
                }
    
            });
        };

        graphics.addChild(colors);
        this.stage.updateChildPositions();
        this.stage.getCarIndex = function(){return cCar + cColor;};


    },

    create: function(application){
        var instance = Object.create(this);
        instance.init(application);
        application.stage.addChild(instance.stage);
       instance.stage.pivot.x = -application.screen.width/4;
       instance.stage.pivot.y = -application.screen.height/5;

        instance.stage.updatePosition = function (){

            instance.stage.x = 0;
            instance.stage.y = 0;
            instance.stage.pivot.x = -application.screen.width/4;
            instance.stage.pivot.y = -application.screen.height/5;
            instance.stage.updateChildPositions();

        };
        instance.stage.alpha = 0;
        return instance.stage;
    }
};

var CoolDownBar = {
    init: function (application, x, y, length, rate) {
        let bar = new PIXI.Graphics();
        let currentLength = 0;
        let colorOfBar = 0x00ff45;
        let active = false;

        this.changeActive = (value) => {
            active = value;
        };

        this.barState = {barWasFull: false};
        


        bar.lineStyle(20, 0x33FF00);
        bar.moveTo(this.currentLength, 30);
        bar.lineTo(this.currentLength, 30);
        application.stage.addChild(bar);


        this.update = () => {
            
            if (this.barState.barWasFull) {
                colorOfBar = 0x6d0101;
            }
            else if (currentLength > (length / 3) * 2) {
                colorOfBar = 0xFF0000;

            }
            else if (currentLength > length / 3) {
                colorOfBar = 0xFFFF00;

            }
            else {
                colorOfBar = 0x00ff45;
            }

            if (active) {
                if (currentLength < length && !this.barState.barWasFull) {
                    currentLength += rate;

                    bar.clear();
                    bar.lineStyle(30, colorOfBar, 1);
                    //aphics.beginFill(0xffFF00, 0.5);

                    bar.moveTo(x, y);
                    bar.lineTo(x + currentLength, y);

                }
                else {

                    this.barState.barWasFull = true;
                }

            }
            else {
                if (currentLength > 0) {
                    currentLength -= rate;

                    bar.clear();
                    bar.lineStyle(30, colorOfBar, 1);

                    bar.moveTo(x, y);
                    bar.lineTo(x + currentLength, y);

                }
                else {
                    this.barState.barWasFull = false;
                }

            }

        };

    },
    create: function (application, x, y, length, rate) {
        let instance = Object.create(this);
        console.log(instance);
        instance.init(application, x, y, length, rate);

        return instance;
    }
};


var menu = Object.create(Menu);
menu.init();
