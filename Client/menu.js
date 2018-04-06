/*jshint esversion: 6 */
//var PIXI = require('pixi.js');

var Menu = {

    app: new PIXI.Application(document.documentElement.clientWidth
        , document.documentElement.clientHeight
        , { backgroundColor: 0x1099bb }),

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

        var startButton = PIXI.Sprite.fromImage("/assets/carSprite.png");
        startButton.anchor.set(0.5);
        startButton.x = this.app.screen.width / 2;
        startButton.y = this.app.screen.height / 2 + 300;

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
            fontSize: 360,
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
        basicText.anchor.set(0.5);
        basicText.x = this.app.screen.width / 2;
        basicText.y = 600;

        this.app.stage.addChild(basicText);




    }




};

var menu = Object.create(Menu);
menu.init();