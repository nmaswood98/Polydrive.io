/*jshint esversion: 6 */
//var PIXI = require('pixi.js');
var Viewport = new PIXI.extras.Viewport();;


var Menu = {

    app: new PIXI.Application(
        
        document.documentElement.clientWidth
        , document.documentElement.clientHeight
        , { backgroundColor: 0x1099bb, autoResize: true }
    
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
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        this.app.renderer.resize(this.app.screen.width*2, this.app.screen.height*2);
      //  this.app.renderer = new PIXI.WebGLRenderer ( this.app.screen.width * 2, this.app.screen.height * 2 );
       // this.app.screen.width = this.app.screen.width * 2;
       // this.app.screen.height = this.app.screen.height * 2;
      //  this.app.renderer.resize(this.app.screen.width * 2, this.app.screen.height * 2);
    //=  this.app.stage.scale.set(0.51);
    // this.app.stage.width = this.app.stage.width * 2;
    // this.app.stage.height = this.app.stage.height * 2;
     // this.app.stage.x = 0;
    //  this.app.stage.y = 0;
     // this.app.renderer.resize(this.app.screen.width, this.app.screen.height);

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

        this.viewport = this.app.stage;
       
        
      
        
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
       var spriteSheet = a.resources["/polydriveSpriteSheet.json"].textures; 
        var that = this.menu;
       console.log(this);
        that.app.view.style.position = 'absolute';
        that.app.view.style.left = '50%';
        that.app.view.style.top = '50%';
        that.app.view.style.transform = 'translate3d( -50%, -50%, 0 )';
        that.app.view.style.zIndex = -1;
        that.mouse = that.app.renderer.plugins.interaction.mouse.global;
        

        that.tilingSprite = new PIXI.extras.TilingSprite(
            spriteSheet["TextureBackground.png"],
            that.app.screen.width * 20,
            that.app.screen.height * 20
        );
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
        var textbox = document.getElementById("nameField");
        
     /* var lb = Object.create(Leaderboard);
      lb.init(that.app);
      lb.updateLeaderboard([{name:'nabhan',score:2232},{name:"maswood",score:3232},{name:"pablo",score:23892}]);
 */
        startButton.on('pointerdown', ()=>{
   //         lb.addPlayer({name:"yolo",score:23293});
            textbox.style.display = "none";
            while(that.app.stage.children[0]) { that.app.stage.removeChild(that.app.stage.children[0]); }



            var gameNet = Object.create(GameNet);
            gameNet.init(that.app,textbox.value);
            gameNet.app.ticker.add(function(delta){gameNet.ticker(delta);});

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
      console.log(spriteSheet);
        var carSprite = new PIXI.Sprite(spriteSheet["car2_neongreen.png"]);
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
   that.lBoard = Leaderboard.create(that.app);
   that.sLabel = ScoreLabel.create(that.app);
     
   that.lBoard.updateLeaderboard([{name:'nabhan',score:121},{name:"maswood",score:1},{name:"pablo",score:1},]);
    console.log(that.lBoard.getBounds());
    
    
   



    },

    createLeaderboard: function(){


        
    },

    

    ticker: function(delta){

   
    }

};

var ScoreLabel = {
    init: function(application){
        this.app = application;

        var scoreText = new PIXI.Text('Score: 0', {
            fontFamily: 'Tahoma',
            fontSize: 35,
            fill: 'white',
            strokeThickness: 8,
            lineJoin: "round",
            align: 'left'
        }); 

        scoreText.x = 20;
        scoreText.y = this.app.screen.height - scoreText.height - 20;

        this.app.stage.addChild(scoreText);

        this.updateScoreLabel = function(score){
            scoreText.text = 'Score: ' + score;
        };

    },

    create: function(application){
        var instance = Object.create(this);
        instance.init(application);
        return instance;

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
     this.board.updateLeaderboard = function(leaderBoardData){ //places entire array of players onto the leaderboard replacing the current leaderboard
            count = 0;
            playerNames.text = "";
            playerScores.text = "";

            leaderBoardData.forEach(element => {
              this.addPlayer(element);
            });
            
            //leaderBoardTitle.x = this.app.screen.width - leaderBoardTitle.width - ((playerScores.x - playerNames.x)/2) + 10;
            //console.log( );
            //console.log(leaderBoardTitle.x + " tite");

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

var menu = Object.create(Menu);
menu.init();
