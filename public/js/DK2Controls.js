/*
Based on Lars Ivar Hatledal

   @modified by Marco Marchesi (quaternions)
*/
THREE.DK2Controls = function(object) {
  this.object = object;
  this.ws;
  this.sensorData;
  this.lastId = -1;
  
  this.controller = new THREE.Object3D();
  this.headPos = new THREE.Vector3();
  this.headQuat = new THREE.Quaternion();
  
  this.translationSpeed  = 5;
  this.lookSpeed = 0;
  
  this.wasdqe = {
    left: false,
    up: false,
    right: false,
    down: false,
    turnLeft: false,
    turnRight: false
  };
  
  this.offsetCart = {
    no: [-0.7, -4.8],
    ne: [0.7, -4.8],
    so: [-0.7, -2.5],
    so2: [-0.7, -3.7],
    se: [0.7, -2.5],
    se2: [0.7, -3.7]
  };

  var that = this;
  var ws = new WebSocket("ws://localhost:8888/ws");
  ws.onopen = function () {
    console.log("### Connected ####");
  };

  ws.onmessage = function (evt) {
    var message = evt.data;
    try {
      that.sensorData = JSON.parse(message);
    } catch (err) {
      console.log(message);
    }
  };

  ws.onclose = function () {
    console.log("### Closed ####");
  };
  
  
  this.onKeyDown = function (event) {

    if(!pause) {
      
      switch (event.keyCode) {
        case 81: /*Q*/
          this.wasdqe.turnLeft = true;
          break;
        case 69: /*E*/
          this.wasdqe.turnRight = true;
          break;
        case 87: /*W*/
          this.wasdqe.up = true;
          break;
        case 83: /*S*/
          this.wasdqe.down = true;
          break;
        case 68: /*D*/
          this.wasdqe.right = true;
          break;
        case 65: /*A*/
          this.wasdqe.left = true;
          break;
      }
    }
  };
  
  this.onKeyUp = function (event) {
    switch (event.keyCode) {

      case 81: /*Q*/
        this.wasdqe.turnLeft = false;
        break;
      case 69: /*E*/
        this.wasdqe.turnRight = false;
        break;
      case 87: /*W*/
        this.wasdqe.up = false;
        break;

      case 83: /*S*/
        this.wasdqe.down = false;
        break;

      case 68: /*D*/
        this.wasdqe.right = false;
        break;

      case 65: /*A*/
          this.wasdqe.left = false;
          break;
    }
  };

  function childGlobalPosition(obj){
    var rows = obj.children.length;
    var x = new Array(rows);

      if (rows > 0) 
      {
        obj.updateMatrixWorld();
        for (var i = 0; i < rows; i++) 
        {
          x[i] = new THREE.Vector3();
          x[i].setFromMatrixPosition( obj.children[i].matrixWorld );
        }
          return x;
      }else return null;
  };

  this.update = function(delta) {

   /* OCULUS ON */
    if (this.sensorData) {
      var id = this.sensorData[0];
      if (id > this.lastId) {
        this.headPos.set(this.sensorData[1]*10, this.sensorData[2]*10, this.sensorData[3]*10);
        this.headQuat.set(this.sensorData[4], this.sensorData[5], this.sensorData[6], this.sensorData[7]);
        
        var gloveQuaternion = new THREE.Quaternion();
        // commented the line below
        // this.camera.setRotationFromQuaternion(this.headQuat);
        /* combine head rotations and glove rotations */
        gloveQuaternion.setFromEuler(new THREE.Euler( 0, this.lookSpeed, 0, 'XYZ' ));
        var finalQuaternion = new THREE.Quaternion();
        finalQuaternion.multiplyQuaternions(gloveQuaternion,this.headQuat);

        /* transform camera and controller rotations */
        this.object.setRotationFromQuaternion(finalQuaternion);

        //TODO calculate position with angle from 'this.lookSpeed'
        this.controller.setRotationFromMatrix(this.object.matrix);
        cart_mesh.setRotationFromQuaternion(gloveQuaternion); 

      }
      this.lastId = id;
    } 
    // /* OCULUS OFF */
    // else {
    //     var gloveQuaternion = new THREE.Quaternion();
    //     gloveQuaternion.setFromEuler(new THREE.Euler( 0, this.lookSpeed, 0, 'XYZ' ));
    //     this.object.setRotationFromQuaternion(gloveQuaternion);
    //     this.controller.setRotationFromMatrix(this.object.matrix); 
    //     cart_mesh.setRotationFromMatrix(this.object.matrix); 
    // }
    /* CHECK KEY CONTROLS */

    if(this.wasdqe.turnLeft){
      var isColliding = iscollided('turnLeft');

      if(isColliding == 0)
      {
        this.lookSpeed += 0.02;
        var turnQuaternion = new THREE.Quaternion();
        turnQuaternion.setFromEuler(new THREE.Euler( 0, this.lookSpeed, 0, 'XYZ' ));
        // console.log('lookSpeed: ' + this.lookSpeed);

        /* transform camera and controller rotations */
        var finalQuaternion = new THREE.Quaternion();
        finalQuaternion.multiplyQuaternions(turnQuaternion,this.headQuat);
        /* transform camera and controller rotations */
        this.object.setRotationFromQuaternion(finalQuaternion);
        //TODO calculate position with angle from 'this.lookSpeed'
        this.controller.setRotationFromMatrix(this.object.matrix);

        cart_mesh.setRotationFromMatrix(this.object.matrix);
      }
    }

    if(this.wasdqe.turnRight){
       var isColliding = iscollided('turnRight');

        if(isColliding == 0)
        {
        this.lookSpeed += -0.02;
        //console.log('lookSpeed: ' + this.lookSpeed);
        
        var turnQuaternion = new THREE.Quaternion();
        turnQuaternion.setFromEuler(new THREE.Euler( 0, this.lookSpeed, 0, 'XYZ' ));

        /* transform camera and controller rotations */
        var finalQuaternion = new THREE.Quaternion();
        finalQuaternion.multiplyQuaternions(turnQuaternion,this.headQuat);
        /* transform camera and controller rotations */
        this.object.setRotationFromQuaternion(finalQuaternion);
        //TODO calculate position with angle from 'this.lookSpeed'
        this.controller.setRotationFromMatrix(this.object.matrix);

        cart_mesh.setRotationFromMatrix(this.object.matrix); 
        // }
        }
    }

    // update position TODO here for rotate the cart ???
    if (this.wasdqe.up){
        var isColliding = iscollided('up');
       if(isColliding == 0){
        this.controller.translateZ(-this.translationSpeed * delta * walkingFactor);
       }   
    }
     
    if (this.wasdqe.down){
      var isColliding = iscollided('down');
      if(isColliding == 0){
         this.controller.translateZ(this.translationSpeed * delta * walkingFactor);
       }   
    }
     
    if (this.wasdqe.right){
      var isColliding = iscollided('right');
       if(isColliding == 0){
         this.controller.translateX(this.translationSpeed * delta * walkingFactor);
       } 
    }
      
    if (this.wasdqe.left){
       var isColliding = iscollided('left');
       if(isColliding == 0){
         this.controller.translateX(-this.translationSpeed * delta * walkingFactor);
       } 
    }

    /* UPDATE POSITIONS */
    // both camera and object (camera's bounding box) need to be updated
    this.object.position.addVectors(this.controller.position, this.headPos);
    camera.position.addVectors(this.controller.position, this.headPos);
    cart_mesh.position.addVectors(this.controller.position, this.headPos);

    if (ws) {
        if (ws.readyState === 1) {
          ws.send("get\n");
        }
      }
   };
  
    window.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
    window.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );
  
<<<<<<< HEAD
    function bind( scope, fn ) {
     return function () {
       fn.apply( scope, arguments );
      };
    };

function iscollided(cmd){
  var t_x, t_y;
  var gc = childGlobalPosition(cart_mesh);
  switch(cmd) {
    case 'up':
      for (var i = 0; i < gc.length; i++) {
        t_x = gc[i].x - Math.sin(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
        t_y = gc[i].z - Math.cos(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
        //console.log('(t_x,t_y)=(' + Math.sin(controls.lookSpeed) + ',' + Math.sin(controls.lookSpeed) + ')');
        //console.log('coll: ' + collision.detect(t_x,t_y));
         if(collision.detect(t_x,t_y)) return 1; //collisione
      }
      break;
    case 'down':
      for (var i = 0; i < gc.length; i++) {
        t_x = gc[i].x + Math.sin(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
        t_y = gc[i].z + Math.cos(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
         if(collision.detect(t_x,t_y)) return 1; //collisione
      }
      break;
    case 'right':
      for (var i = 0; i < gc.length; i++) {
        t_x = gc[i].x + Math.cos(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
        t_y = gc[i].z - Math.sin(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
         if(collision.detect(t_x,t_y)) return 1; //collisione
      }
      break;
    case 'left':
      for (var i = 0; i < gc.length; i++) {
        t_x = gc[i].x - Math.cos(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
        t_y = gc[i].z + Math.sin(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
         if(collision.detect(t_x,t_y)) return 1; //collisione
      }
      break;
    case 'turnLeft':
      for (var i = 0; i < gc.length; i++) {
        console.log('lookSpeed: ' + controls.lookSpeed);
        t_x = gc[i].x - Math.sin(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
        t_y = gc[i].z - Math.cos(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
         if(collision.detect(t_x,t_y)) return 1; //collisione
      }
      break;
    case 'turnRight':
      for (var i = 0; i < gc.length; i++) {
        console.log('lookSpeed: ' + controls.lookSpeed);
        t_x = gc[i].x + Math.cos(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
        t_y = gc[i].z - Math.sin(controls.lookSpeed)*(controls.translationSpeed * delta * walkingFactor);
         if(collision.detect(t_x,t_y)) return 1; //collisione
      }
      break;
  }

  return 0; //nessuna collisione
};

  //funzione ad uso di debug
function printSphere(x,z, nome){
  // console.log('PRINT SPHERE: ' + scene.getObjectByName(nome));
  var _x = x;
  var _y = 0;//camera.position.y-2;
  var _z = z;

  // var dummy = new THREE.Object3D();
  // dummy.position.y = camera.y;
  // var your_object = new THREE.Mesh( geometry, material );
  // your_object.position.x = 100;


  // scene.addObject( dummy );

  // if(!scene.getObjectByName(nome))  //non esiste ancora nessun oggetto con nome
  // {
  //   sp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 40, 40),new THREE.MeshLambertMaterial({color:'red', transparent: true, opacity: 0.5}));
  //   sp.position.set(_x,_y,_z);
  //   // sp.name = nome;

  //   // dummy.add(sp);
  //   // dummy.name = nome;
  //   // dummy.position.set(camera.position.x,camera.position.y,camera.position.z);
  //   scene.remove(cart_mesh);
  //   cart_mesh.add(sp);
  //   scene.add(cart_mesh);
  //   //scene.add(dummy);
  // } else {
  //   // scene.getObjectByName(nome).position.set(_x,_y,_z);
  //   //scene.getObjectByName(nome).position.set(camera.position.x,camera.position.y,camera.position.z);
  //   // scene.getObjectByName(nome).position = camera.position;

  // }      
}
//-------------------------

=======
  function bind( scope, fn ) {

    return function () {

      fn.apply( scope, arguments );
    };
  };
  
>>>>>>> 5aa3c4e4eee309923630b052e3f480743fd2984b
};