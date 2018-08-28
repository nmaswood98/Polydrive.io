/*jshint esversion: 6 */
//var PIXI = require('pixi.js');



var Menu = {

    app: new PIXI.Application(document.documentElement.clientWidth
        , document.documentElement.clientHeight
        , { backgroundColor: 0x1099bb }),
        

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
        that.app.stage.addChild(that.tilingSprite);
        
        that.app.stage.setChildIndex(that.tilingSprite,0);


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
        startButton.on('pointerdown', ()=>{
            textbox.style.display = "none";
            while(that.app.stage.children[0]) { that.app.stage.removeChild(that.app.stage.children[0]); }



            var gameNet = Object.create(GameNet);
            gameNet.init(that.app,textbox.value);
            gameNet.app.ticker.add(function(delta){gameNet.ticker(delta);});

        });


        that.app.stage.addChild(startButton);

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
        logo.x = that.app.screen.width / 2;
        logo.y = 450;

        that.app.stage.addChild(logo);


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
             that.app.stage.addChild(manaSprite);
             
        }



       // let textures = PIXI.loader.resources["car12_blue.png"].texture;
       console.log(spriteSheet);
        var carSprite = new PIXI.Sprite(spriteSheet["car2_neongreen.png"]);
        carSprite.interactive = false;
        carSprite.anchor.set(0.5,0.5);
        //carSprite.updated = true;
        carSprite.x = 1500;
        carSprite.y = 1000;
       // carSprite.id = u.id;
        carSprite.rotation = Math.PI/2;
        carSprite.scale.x = 10;
        carSprite.scale.y = 10;
        that.app.stage.addChild(carSprite);




       // createjs.Tween.get(logo).to({x:100,y:100},3000);
       // createjs.Ticker.framerate = 60;


    },

    ticker: function(delta){
     
    }

};

var menu = Object.create(Menu);
menu.init();
menu.app.ticker.add(function(delta){menu.ticker(delta);});