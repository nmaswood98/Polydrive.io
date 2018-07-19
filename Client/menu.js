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
        document.body.appendChild(this.app.view);

        this.app.view.style.position = 'absolute';
        this.app.view.style.left = '50%';
        this.app.view.style.top = '50%';
        this.app.view.style.transform = 'translate3d( -50%, -50%, 0 )';
        this.app.view.style.zIndex = -1;

        var texture = PIXI.Texture.fromImage('/assets/TextureBackground.png');

        this.tilingSprite = new PIXI.extras.TilingSprite(
            texture,
            this.app.screen.width * 20,
            this.app.screen.height * 20
        );
        this.app.stage.addChild(this.tilingSprite);
        
        this.app.stage.setChildIndex(this.tilingSprite,0);


        document.documentElement.style.overflow = 'hidden';  // firefox, chrome
        document.body.scroll = "no";

        var startButton = PIXI.Sprite.fromImage("/assets/Play.png");
        var logo = PIXI.Sprite.fromImage("/assets/polydrivelogo.png");
        startButton.anchor.set(0.5);
        startButton.x = this.app.screen.width / 2;
        startButton.y = this.app.screen.height / 2;
        startButton.scale.x *= 1.8;
        startButton.scale.y *= 1.8;
        startButton.interactive = true;
        startButton.buttonMode = true;
        var textbox = document.getElementById("nameField");
        startButton.on('pointerdown', ()=>{
            textbox.style.display = "none";
            while(this.app.stage.children[0]) { this.app.stage.removeChild(this.app.stage.children[0]); }


            var game = Object.create(Game);
            game.init(this.app,textbox.value);
            game.app.ticker.add(function(delta){game.ticker(delta);});


        });


        this.app.stage.addChild(startButton);

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
        logo.x = this.app.screen.width / 2;
        logo.y = 450;

        this.app.stage.addChild(logo);

        for(var i = 0; i < 20; i++){

            var manaSprite = new PIXI.Graphics();
            // manaSprite.anchor.set(0.5,0.5);
             
             manaSprite.x = Math.floor(Math.random() * this.app.screen.width );
             manaSprite.y = Math.floor(Math.random() * this.app.screen.height);
             manaSprite.beginFill(this.randomColor());
             manaSprite.drawCircle(0,0,10);
             manaSprite.endFill();
             this.app.stage.addChild(manaSprite);
             
        }




    }

};

var menu = Object.create(Menu);
menu.init();