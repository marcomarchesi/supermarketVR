// var chalk = require('chalk');

function LOLCollision(sceneSize){

  this.map = [[]];
  this.mapFactor = 1;
  // TODO - CALCULATE SCENE SIZE
  this.sceneFactor = 9/sceneSize;   // SIZE(MAP)-1/ SIZE(SCENE) = 9/50
  this.position = {x:0,
                   y:0};


}

// scene 50x50
// data 3x3
// map 10x10

/* it will receive a .png map as input */
LOLCollision.prototype.create = function(mapSize){

  var data = [[0,1,0],
             [0,1,1],
             [1,0,1]];

  this.mapFactor = (data.length - 1)/(mapSize-1);  //  SIZE(DATA) - 1 / SIZE(MAP) - 1


  this.map = [[0,0,0,0,0,0,0,0,0,0],
             [0,0,0,0,0,0,0,0,0,0],
             [0,0,0,0,0,0,0,0,0,0],
             [0,0,0,0,0,0,0,0,0,0],
             [0,0,0,0,0,0,0,0,0,0],
             [0,0,0,0,0,0,0,0,0,0],
             [0,0,0,0,0,0,0,0,0,0],
             [0,0,0,0,0,0,0,0,0,0],
             [0,0,0,0,0,0,0,0,0,0],
             [0,0,0,0,0,0,0,0,0,0]];


  for (var i = 0; i < mapSize;++i)
    for (var j = 0; j < mapSize; ++j){
      this.map[i][j] = data[Math.round(i * this.mapFactor)][Math.round(j * this.mapFactor)];
    }

  return this.map;

};

LOLCollision.prototype.detect = function(x,y){

  /* TODO vertex positions have to be remapped on a range (0,0) -> (scene_size,scene_size) */
  var _x = Math.abs(x);
  var _y = Math.abs(y);
  // console.log(_x);
  // console.log(_y);
  return this.map[Math.round(_x * this.sceneFactor)][Math.round(_y * this.sceneFactor)];

};

/* print the map on terminal */
LOLCollision.prototype.print = function(map){

  var size = this.map.length;
  var output = "";
  for(var i = 0;i < size; ++i){
    for(var j = 0; j < size; ++j){
      if(j == size-1)
        output += this.map[i][j];
      else
        output += this.map[i][j] + ',';
    }
    output += '\n';
  }
  console.log(chalk.yellow(output));
};

// module.exports = LOLCollision;