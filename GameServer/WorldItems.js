
var Polygon = require('detect-collisions').Polygon;


module.exports.WorldItems = {
Car:  {
    init: function(id,isPlayer,spawnPosition,system){
        var width = 149, height = 70, thickness = 10;
        var velocity = {x:0,y:0};
    
        var head = new Polygon(spawnPosition.x,spawnPosition.y,[[-width/2, -height/2],[-width/2, height/2]]);

        this.cBody = system.createPolygon(spawnPosition.x, spawnPosition.y, [[-width/2, -height/2], [width/2, -height/2], [width/2, height/2], [-width/2, height/2]]);
        this.cBody.head = head;
        this.cBody.par = this;
    
        
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

        this.speed = 1;
        
        this.changeID= (i)=>{this.id = i; };

        Object.defineProperty(this, 'position', {
            get: function() {
                return {x: this.cBody.x , y: this.cBody.y };
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
                return this.cBody.angle;
            },
            set: function(a) {
                head.angle = a;
                this.cBody.angle = a;
                
            }
        });

        Object.defineProperty(this, 'velocity', {
            get: function() {
                return velocity;
            },
            set: function(v) {
                
                velocity = v;
            }
        });

        this.translate = function(pos){
            
            
            this.cBody.x = this.cBody.x + pos.x; this.cBody.y = this.cBody.y + pos.y;
        head.x = head.x + pos.x; head.y = head.y + pos.y;
        
        };
    
    },

    create: function(id,isPlayer,spawnPosition,system){
        var instance = Object.create(this);
        instance.init(id,isPlayer,spawnPosition,system);
        return instance;
    }


},

Vector: { //Used to perform Vector Calculations, v is a vector, s is  a scalar
    magnitude: function(v){
        return Math.sqrt((v.x * v.x) + (v.y * v.y));
    },

    normalise: function(v){
        var m = this.magnitude(v);
        if (m === 0)
            return {x:0,y:0};
        return { x:v.x/m , y: v.y/m };
    },

    rotate: function(v,angle){
        var cos = Math.cos(angle), sin = Math.sin(angle);
        return { x:(v.x * cos - v.y * sin), y:(v.x * sin + v.y * cos) };
    },

    add: function(v1,v2){
        return { x:(v1.x + v2.x), y:(v1.y + v2.y) };
    },

    sub: function(v1,v2){
        return { x:(v1.x - v2.x), y:(v1.y - v2.y) };
    },

    mult: function(v,s){
        return { x:(v.x * s), y:(v.y * s) };
    },

    div: function(v,s){
        return { x:(v.x/s), y:(v.y/s) };
    }

}
};
