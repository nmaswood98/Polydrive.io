
var Matter = require('../Assets/matter.js');
var Engine = Matter.Engine,
    Render = Matter.Render,
    Bodies = Matter.Bodies,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Mouse = Matter.Mouse,
    World = Matter.World;
module.exports.WorldItems = {
Car:  {
    init: function(id,isPlayer,spawnPosition){
        var width = 149, height = 70, thickness = 10;
        
        
      
             
        
         

        var top = Bodies.rectangle(spawnPosition.x - ((width - thickness) / 2 + thickness / 2),spawnPosition.y, thickness, height);
            top.collisionType = 0;
            top.tag = 1;
        //   top.isSensor = true;
            top.isStatic = true;
            top.id = id;
        var bottom = Bodies.rectangle(spawnPosition.x,spawnPosition.y, width - thickness, height);
            bottom.tag = 0;
            bottom.collisionType = 0;
            bottom.id = id;
            bottom.isSensor = false;
            bottom.isStatic = true;

        var car = Body.create({
            parts: [top, bottom]
        });
        Matter.Body.setStatic(car, true);
         if(isPlayer)
            this.follower = this;
        else 
            this.follower = null;

        this.manaCount = 0;
        this.carMeter = 0;
        this.collisionType = 0;
        this.followerArray = [];
      
        this.id = id;
        this.moving = true;
        this.removed = false;
        this.spectating = false;
        this.body = car;
        this.changeID= (i)=>{this.id = i; top.id = "top" + i; bottom.id = "bot" + i;};
       // Matter.Body.setVelocity(car,{x:4,y:4});
        Object.defineProperty(this, 'position', {
            get: function() {
                return car.position;
            },
            set: function(pos) {
                car.position = pos;
            }
        });

        Object.defineProperty(this, 'angle', {
            get: function() {
                return car.angle;
            },
            set: function(a) {
                Matter.Body.setAngle(car, a);
            }
        });

        

        Object.defineProperty(this, 'velocity', {
            get: function() {
                return car.velocity;
            },
            set: function(v) {
                Matter.Body.setVelocity(car,v);
            }
        });

        this.translate = function(pos){Matter.Body.translate(car,pos);};

    
    
    },

    create: function(id,isPlayer,spawnPosition){
        var instance = Object.create(this);
        instance.init(id,isPlayer,spawnPosition);
        return instance;
    }


}
};
