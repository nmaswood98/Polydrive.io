
var Polygon = require('detect-collisions').Polygon;

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
    init: function(id,isPlayer,spawnPosition,system){
        var width = 149, height = 70, thickness = 10;
        
        
      
             
        
        var head = new Polygon(spawnPosition.x,spawnPosition.y,[[-width/2, -height/2],[-width/2, height/2]]);
        this.cBody = system.createPolygon(spawnPosition.x, spawnPosition.y, [[-width/2, -height/2], [width/2, -height/2], [width/2, height/2], [-width/2, height/2]]);
        this.cBody.head = head;
        this.cBody.par = this;
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
               // console.log(this.cBody.parent);
                return car.position;
            },
            set: function(pos) {
                head.x = pos.x;
                head.y = pos.y;
                this.cBody.x = pos.x;
                this.cBody.y = pos.y;
                car.position = pos;
            }
        });

        Object.defineProperty(this, 'angle', {
            get: function() {
               // console.log(car.angle + " a " + this.cBody.angle);
                return car.angle;
            },
            set: function(a) {
                head.angle = a;
                this.cBody.angle = a;
                Matter.Body.setAngle(car, a);
            }
        });

        

        Object.defineProperty(this, 'velocity', {
            get: function() {
             //   console.log(this.cBody.x + " adsf " +  car.position.x);
                return car.velocity;
            },
            set: function(v) {
                Matter.Body.setVelocity(car,v);
            }
        });

        this.translate = function(pos){Matter.Body.translate(car,pos); this.cBody.x = this.cBody.x + pos.x; this.cBody.y = this.cBody.y + pos.y;
        head.x = head.x + pos.x; head.y = head.y + pos.y;
        
        };

    
    
    },

    create: function(id,isPlayer,spawnPosition,system){
        var instance = Object.create(this);
        instance.init(id,isPlayer,spawnPosition,system);
        return instance;
    }


},

Vector: {
    change: function(v){
        v.x += 1;
        v.y += 1;
    }

}
};
