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
     
        

    init: function () {
        this.serverIP = null;
        fetch("/GameServer/east")
        .then((response) => {
          return response.text();
        })
        .then((serverIP) => {
          this.serverIP = serverIP;
          console.log(this);
        });
       
        this.screenSprites = {};
        this.manaSprites = {};
        this.OnScreen = new PIXI.Container();

        const draw = (snapShot)=>{

        };













        
        TweenMax.ticker.fps(60);
        this.app.mouse = this.app.renderer.plugins.interaction.mouse.global;
        var poop = 1 + 'a';
        console.log(typeof poop);
        this.stage = new PIXI.Container();
        this.app.stage.addChild(this.stage);
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        this.app.renderer.resize(this.app.screen.width*2, this.app.screen.height*2);


     this.app.renderer.view.style.width = this.app.screen.width/2 + "px";
     this.app.renderer.view.style.height = this.app.screen.height/2 + "px";
        console.log( this.app.screen.width);
      //  this.app.renderer.resize(this.app.screen.width/2, this.app.screen.height/2);
       
        //this.app.roundPixels = true;
        var size = [16, 9];
        var ratio = size[0] / size[1];  

        console.log(this.app.screen.width); 

        
        
        
        window.addEventListener('resize',()=>{
        
  
            // You can use the 'screen' property as the renderer visible
            // area, this is more useful than view.width/height because
            // it handles resolution
            
           
          
       
        });

        this.viewport = this.stage;
       
        
      
        
       // var renderer = PIXI.autoDetectRenderer(size[0], size[1], null);
        
        document.body.appendChild(this.app.view);
        console.log(this);
        var that = this;
        var loadGame = (a)=>{
            that.setup(a).call(that);

        }
        
        PIXI.loader
        .add('/polydriveSpriteSheet.json')
        .load(this.setup);
        var that = this;
       
        //this.setup(PIXI.loader);
        console.log(PIXI.loader);
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

        that.hideMenu = function(){
            textbox.style.display = "none";
            that.stage.visible = false;
           
    
        };
    
        that.showMenu = function(){
            that.stage.visible = true;
            console.log(textbox);
            textbox.style.display = "";
        };

        


        //document.body.focus();
        
        
        that.tilingSprite = new PIXI.extras.TilingSprite(
            spriteSheet["TextureBackground.png"],
            that.app.screen.width * 20,
            that.app.screen.height * 20
        );
       // that.tilingSprite.visible = false;
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
       
        
     /* var lb = Object.create(Leaderboard);
      lb.init(that.app);
      lb.updateLeaderboard([{name:'nabhan',score:2232},{name:"maswood",score:3232},{name:"pablo",score:23892}]);
 textbox.style.display = "none";*/
        startButton.on('pointerdown', ()=>{
   
           // textbox.style.display = "none";
           // while(that.app.stage.children[0]) { that.app.stage.removeChild(that.app.stage.children[0]); }
                that.hideMenu();


            if(!that.manager){
                
                if(that.serverIP != null){
                    that.manager = Object.create(Manager);
                    console.log(that.cCarIndex);
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
        logo.y = that.app.screen.height/4;

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
      // console.log(a.resources["/polydriveSpriteSheet.json"].data.animations.nitro);
      
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

   // var textSample = that.createText(20,0,'Score: 0',35,'left');
  // that.lBoard = Leaderboard.create(that.app);
  // that.sLabel = ScoreLabel.create(that.app);
     
  // that.lBoard.updateLeaderboard([{name:'nabhan',score:121},{name:"maswood",score:1},{name:"pablo",score:1},]);
    //console.log(that.lBoard.getBounds());
    
    
   
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
    console.log(textbox.style.display);
    carChangeText.on("pointerdown",function(){
        
        if(carChangeText.carpicker === undefined)
            carChangeText.carpicker = CarPicker.create(that.app);
        else
            carChangeText.carpicker.visible = true;

        textbox.style.display = "none";
        var blurFilter2 = new PIXI.filters.BlurFilter();
        blurFilter2.resolution = 0.5;
        //that.viewport.filterArea = new PIXI.Rectangle(0, 0, that.app.screen.width,that.app.screen.height);
        blurFilter2.blur = 0;
      TweenMax.to(blurFilter2 ,0.1,{
            ease:Linear.easeNone,
            blur:10
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
        carSprite.texture = spriteSheet[that.cCarIndex];
        that.viewport.interactive = false;

        TweenMax.to(blurFilter2 ,0.1,{
            ease:Linear.easeNone,
            blur:0
        });

        TweenMax.to(carChangeText.carpicker ,0.1,{
            ease:Linear.easeNone,
            pixi:{alpha:0},
            onComplete:function(){carChangeText.carpicker.visible = false;textbox.style.display = "";}
        });
        textbox.style.display = "";

       
        
    });



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
        return instance.scoreText;

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
       var playerNames = new PIXI.Text('Pixi.js can has\n multiline text!' , {
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
        var playerScores = new PIXI.Text('Pixi.js can has\n multiline text!' , {
            fontFamily: 'Tahoma',
            fontSize: 35,
            fill: 'white',
            strokeThickness: 8,
            lineJoin: "round",
            align: 'center'
        });
       // console.log(playerScores.width);
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
     //   console.log(this.app.stage.width);
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
        return instance.board;
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


        var cColor = 0;
        var cCar = 0;
        var carSprite = new PIXI.Sprite(spriteSheet[0]);
        carSprite.interactive = false;
        carSprite.anchor.set(0.5,0.5);
        carSprite.x = graphics.width/2;
        carSprite.y = graphics.height/2;
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
       // console.log();
        arrow.x = carSprite.x - limit;
        //console.log(carSprite.x - arrow.x);
        arrow.y = graphics.height/2;
        arrow.scale.set(0.4);
        arrow.rotation = Math.PI;
        graphics.addChild(arrow);

        var arrow2 = new PIXI.Sprite(spriteSheet["arrow"]);
        arrow2.interactive = true;
        arrow2.anchor.set(0.5,0.5);
        arrow2.x = carSprite.x + limit;
        arrow2.y = graphics.height/2;
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
        colors.lineStyle(0);
        colors.beginFill(0xff0000);
        colors.drawCircle(graphics.width/9, graphics.height - 100,30);
        colors.endFill();

        colors.lineStyle(0);
        colors.beginFill(0x8e98f2);
        colors.drawCircle((graphics.width/9) * 2, graphics.height - 100,30);
        colors.endFill();

        colors.lineStyle(0);
        colors.beginFill(0xa6f58f);
        colors.drawCircle((graphics.width/9) * 3, graphics.height - 100,30);
        colors.endFill();

        colors.lineStyle(0);
        colors.beginFill(0xcc85fc);
        colors.drawCircle((graphics.width/9) * 4, graphics.height - 100,30);
        colors.endFill();

        colors.lineStyle(0);
        colors.beginFill(0xf68ada);
        colors.drawCircle((graphics.width/9) * 5, graphics.height - 100,30);
        colors.endFill();

        colors.lineStyle(0);
        colors.beginFill(0xa5aa5d);
        colors.drawCircle((graphics.width/9) * 6, graphics.height - 100,30);
        colors.endFill();

        colors.lineStyle(0);
        colors.beginFill(0xfcc884);
        colors.drawCircle((graphics.width/9) * 7, graphics.height - 100,30);
        colors.endFill();

        colors.lineStyle(0);
        colors.beginFill(0xbe9763);
        colors.drawCircle((graphics.width/9) * 8, graphics.height - 100,30);
        colors.endFill();

        colors.on('pointerdown',(s)=>{
            
            var pos = this.stage.pivot.x + application.mouse.x;
            var buff = 30;
           console.log(pos);

           
           

            if(pos > (graphics.width/9) * 8 - buff){
                console.log("BROWN");
                cColor = 35;
                carSprite.texture = spriteSheet[cCar + cColor];
            }
                
            else if(pos > (graphics.width/9) * 7 - buff){
                console.log("YELLOW");
                cColor = 15;
                carSprite.texture = spriteSheet[cCar + cColor];
                
            }
                
            else if(pos > (graphics.width/9) * 6 - buff){
                console.log("ARMYGREEN");
                cColor = 25;
                carSprite.texture = spriteSheet[cCar + cColor];
            }
                
            else if(pos > (graphics.width/9) * 5 - buff){
                console.log("PINK");
                cColor = 30;
                carSprite.texture = spriteSheet[cCar + cColor];
            }
                
            else if(pos > (graphics.width/9) * 4 - buff){
                console.log("PURPLE");
                cColor = 20;
                carSprite.texture = spriteSheet[cCar + cColor];
            }
                
            else if(pos > (graphics.width/9) * 3 - buff){
                console.log("GREEN");
                cColor = 10;
                carSprite.texture = spriteSheet[cCar + cColor];
            }
                
            else if(pos > (graphics.width/9) * 2 - buff){
                console.log("BLUE");
                cColor = 5;
                carSprite.texture = spriteSheet[cCar + cColor];
            }
                
            else if(pos > graphics.width/9 - buff){
                console.log("RED");
                cColor = 0;
                carSprite.texture = spriteSheet[cCar + cColor];
            }

    
                

           


        });

        graphics.addChild(colors);

        this.stage.getCarIndex = function(){return cCar + cColor;};


    },

    create: function(application){
        var instance = Object.create(this);
        instance.init(application);
        application.stage.addChild(instance.stage);
       // instance.stage.x = application.screen.width/2;
        instance.stage.pivot.x = -application.screen.width/4;
        instance.stage.pivot.y = -application.screen.height/5;
        instance.stage.alpha = 0;
        return instance.stage;
    }
};

var menu = Object.create(Menu);
menu.init();
