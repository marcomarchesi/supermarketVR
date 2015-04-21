// var chalk = require('chalk');
function LOLCollision(sceneSizet){
  this.sceneSize = sceneSizet;
  //console.log(sceneSizet);
  this.errorCreate = false;       //true: Collision does not work, read bitmap error; false: allrighty!!!
  this.map = [[]];
  this.pixel = {
    w: 0,
    h: 0
  };

  this.pos_ripr = {
    x: 0,
    z: 0
  };
  // TODO - CALCULATE SCENE SIZE

  this.position = {x:0,
                   y:0};
}

/* it will receive a .png map as input */
LOLCollision.prototype.create = function(){

  function Create2DArray(rows,columns) {
   var x = new Array(rows);
   for (var i = 0; i < rows; i++) {
       x[i] = new Array(columns);
   }
   return x;
  }

  // read img_bitmap to create a Matrix collision
  var _img =  document.getElementById('map');
  if(_img)
  {
  var imageattributes = _img.attributes;
  var imageurl = imageattributes.getNamedItem("src").value;
  var myCanvas = document.getElementById('mycanvas');
  if(imageurl!="" && myCanvas)
  {
    var width_res_bit_map = 0;   //if set to 0 it's used the width  of img to read orizontal pixel
    var height_res_bit_map = 0;  //if set to 0 it's used the height of img to read vertical  pixel

    var img = new Image();
    img.src = imageurl;
    if(!width_res_bit_map)  width_res_bit_map  = img.naturalWidth;
    if(!height_res_bit_map) height_res_bit_map = img.naturalHeight;
    console.log('w_map.bmp: ' + width_res_bit_map + 'h.map.bmp: ' + height_res_bit_map);

    var context = myCanvas.getContext('2d');
    context.canvas.width = width_res_bit_map; context.canvas.height = height_res_bit_map;
    context.drawImage(img, 0, 0);
    var imgData = context.getImageData(0, 0, myCanvas.height, myCanvas.width);
    var data = new Array();

    console.log('height_ctx: ' + myCanvas.height + ' width_ctx: ' + myCanvas.width);
    for(i=0;i<myCanvas.height;i++){      
      data[i] = new Array();
        for(j=0;j<myCanvas.width;j++){ 
          if(imgData.data[i*(myCanvas.width*4)+j*4] > 255/2)
            data[i][j] = 0;
          else data[i][j] = 1;
        }
    }
    printMtx(data);
  }else{
  console.log('Read error bitmap!');
  this.errorCreate = true;
  var data = [[0]];
  }
  }else{
    console.log('Read error bitmap!');
    this.errorCreate = true;
    var data = [[0]];
  }
  //-----------------------------------------------------------
  //You can create/modify here a matrix_collision(data) too
  //Ex -----------------------------------------------------------
    // var data = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    //             [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    //             [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
    //             [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
    //             [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,0,0,1,0,0],
    //             [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,0,0,1,0,0],
    //             [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
    //             [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0],
    //             [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0],
    //             [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0],
    //             [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0],
    //             [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
    //             [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0],
    //             [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0],
    //             [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0],
    //             [0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0],
    //             [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
    //             [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    //             [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    //             [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]];
  // ---

  this.pixel.w = this.sceneSize.size().x/data.length;     //dimensioni in x e y di una singola cella della matrice
  this.pixel.h = this.sceneSize.size().z/data[0].length;
  
  console.log('----- Dimensioni mesh scena -----');
  console.log('righe: ' + data.length + ' colonne: ' + data[0].length);
  console.log('pixel_x: ' + this.pixel.w + ' pixel_y: ' + this.pixel.h);
  console.log('-----------------------------------');

  this.map = Create2DArray(data.length,data[0].length);  //map data to nxn array

  for (var i = 0; i < data.length; ++i)
    for (var j = 0; j < data[0].length; ++j){
      this.map[i][j] = data[Math.round(i)][Math.round(j)];
    }

  return this.map;
};

LOLCollision.prototype.detect = function(x,y){
  /* TODO vertex positions have to be remapped on a range (0,0) -> (scene_size,scene_size) */
  console.log('x,y: ' + x.toFixed(2) + ',' + y.toFixed(2));
  if(!this.errorCreate) {
    var _x = x + this.sceneSize.size().x/2 ;
    var _y = y + this.sceneSize.size().z/2;
    var yoff = 0;//1.8;
    var xoff = 0;//1;
    var x_matr = 0, y_matr = 0;
    x_matr = (((_y+yoff)/this.pixel.h).toFixed(0)-1);
    y_matr = (((_x+xoff)/this.pixel.w).toFixed(0)-1);
    
    console.log('matrix value: ' + x_matr + ',' + y_matr);
    if(0 <= x_matr && x_matr < this.map.length && 0 <= y_matr && y_matr < this.map[0].length)
    {
      return this.map[x_matr][y_matr];
    }else {  
    return 1;
    } 
  }else{
      console.log('collision does not work');
      return 0;
  }
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
  console.log((output));
};

function printMtx(map) {
  var size = map.length;
  var output = "";
  for(var i = 0;i < size; ++i){
    for(var j = 0; j < size; ++j){
      if(j == size-1)
        output += map[i][j];
      else
        output += map[i][j] + ',';
    }
    output += '\n';
  }
  console.log((output));
}
// module.exports = LOLCollision;