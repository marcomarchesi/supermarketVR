/*
Copyright 2014 Lars Ivar Hatledal

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   @modified by Pierfrancesco Soffritti
*/

var lastNotCollidingPositionX = 0, lastNotCollidingPositionZ = 0;

THREE.DK2Controls = function(object) {

  this.object = object;
  this.ws;
  this.sensorData;
  this.lastId = -1;

  this.moveForward = false;
  this.moveBackward = false;
  this.moveLeft = false;
  this.moveRight = false;
  this.moveUp = false;
  this.moveDown = false;
  
  this.controller = new THREE.Object3D();
  
  this.headPos = new THREE.Vector3();
  this.headQuat = new THREE.Quaternion();
  
  this.translationSpeed  = 5;
  this.lookSpeed = 0;
  
  this.wasd = {
    left: false,
    up: false,
    right: false,
    down: false
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
        
        case 87: /*W*/
          this.wasd.up = true;
          this.moveForward = true;
          break;

        case 83: /*S*/
          this.wasd.down = true;
          this.moveBackward = true;
          break;

        case 68: /*D*/
          this.wasd.right = true;
          break;

        case 65: /*A*/
            this.wasd.left = true;
            break;

        // case 82: /*R*/
        //     this.moveUp = true; 
        //     break;

        // case 70: /*F*/
        //     this.moveDown = true;
        //     break;
      }

    }
  };
  
  this.onKeyUp = function (event) {
    switch (event.keyCode) {

      case 87: /*W*/
        this.wasd.up = false;
        this.moveForward = false;
        break;

      case 83: /*S*/
        this.wasd.down = false;
        this.moveBackward = false;
        break;

      case 68: /*D*/
        this.wasd.right = false;
        break;

      case 65: /*A*/
          this.wasd.left = false;
          break;

      // case 82: /*R*/
      //     this.moveUp = false; 
      //     break;

      // case 70: /*F*/
      //     this.moveDown = false;
      //     break;
    }
  };


  this.update = function(delta) {

    if (this.sensorData) {
      var id = this.sensorData[0];
      if (id > this.lastId) {
        this.headPos.set(this.sensorData[1]*10, this.sensorData[2]*10, this.sensorData[3]*10);
        this.headQuat.set(this.sensorData[4], this.sensorData[5], this.sensorData[6], this.sensorData[7]);

<<<<<<< HEAD
        // this.lookSpeed += delta/3;
        var gloveQuaternion = new THREE.Quaternion();

        // commented the line below
        // this.camera.setRotationFromQuaternion(this.headQuat);

        /* combine head rotations and glove rotations */
        gloveQuaternion.setFromEuler(new THREE.Euler( 0, this.lookSpeed, 0, 'XYZ' ));
        var finalQuaternion = new THREE.Quaternion();
        finalQuaternion.multiplyQuaternions(gloveQuaternion,this.headQuat);

        /* transform camera and controller rotations */
        this.camera.setRotationFromQuaternion(finalQuaternion);
        this.controller.setRotationFromMatrix(this.camera.matrix);  
=======
        //console.log(this.sensorData[5]);  //Axis of interest?

        this.object.setRotationFromQuaternion(this.headQuat);
        camera.setRotationFromQuaternion(this.headQuat);

        this.controller.setRotationFromMatrix(this.object.matrix);
>>>>>>> master
      }



      this.lastId = id;
    }

    // update position TODO here for rotate the cart ???
    if (this.wasd.up){
      this.controller.translateZ(-this.translationSpeed * delta * walkingFactor);
      
      // this.camera.rotation.y += this.lookSpeed;
      // this.controller.rotation.y += this.lookSpeed;
    }
    if (this.wasd.down)
      this.controller.translateZ(this.translationSpeed * delta);

    if (this.wasd.right)
      this.controller.translateX(this.translationSpeed * delta);

    if (this.wasd.left)
      this.controller.translateX(-this.translationSpeed * delta);

    if (  this.moveUp)
      this.controller.translateY( this.translationSpeed * delta);
    if (this.moveDown)
      this.controller.translateY( - this.translationSpeed * delta);

     //UNDER TEST
<<<<<<< HEAD
      // this.camera.rotation.y += -this.lookSpeed;
      // this.controller.rotateOnAxis(new THREE.Vector3(0,1,0),-this.lookSpeed);
    
    this.camera.position.addVectors(this.controller.position, this.headPos);
=======
      // this.camera.rotation.y = -this.lookSpeed;
      //console.log("look speed is " + this.lookSpeed);   

    // both camera and object (camera's bounding box) need to be updated
    this.object.position.addVectors(this.controller.position, this.headPos);
    // this.object.position.x = this.controller.position.x;
    // this.object.position.y = this.controller.position.y;
    // this.object.position.z = this.controller.position.z;
    //camera.position.x = this.controller.position.x;
    //camera.position.y = this.controller.position.y;
    //camera.position.z = this.controller.position.z;
    camera.position.addVectors(this.controller.position, this.headPos);
    
    handleCollisions(this.object, this.controller);
>>>>>>> master

    //if (this.object.position.y < -10) {
    //   this.object.position.y = -10;
    // }

      if (ws) {
        if (ws.readyState === 1) {
          ws.send("get\n");
        }
      }
  };
  
  window.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
  window.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );
  
  function bind( scope, fn ) {

    return function () {

      fn.apply( scope, arguments );

    };

  };

  var colliding = false;

  function handleCollisions(movingObject, controller) {
    
    // collision detection:
    //   determines if any of the rays from the cube's origin to each vertex
    //   intersects any face of a mesh in the array of target meshes
    //   for increased collision accuracy, add more vertices to the cube;
    //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
    
    actualPosition = controller.position.clone();
    var objectsArray = new Array();
    objectsArray.push(boundingBoxMesh);
    
    for (var vertexIndex = 0; vertexIndex < movingObject.geometry.vertices.length; vertexIndex++) {   
      var localVertex = movingObject.geometry.vertices[vertexIndex].clone();
      var globalVertex = localVertex.applyMatrix4( movingObject.matrix );
      var directionVector = globalVertex.sub( controller.position );
      
      var ray = new THREE.Raycaster( actualPosition, directionVector.clone().normalize() );
      var collisionResults = ray.intersectObjects( objectsArray );
      
      // If the distance to an intersection is less than the distance between the Player's position and the geometry's vertex,
      // then the collision occurred on the interior of the player's mesh -- what we would probably call an "actual" collision.
      if ( (collisionResults.length > 0) && (collisionResults[0].distance < directionVector.length()) ) {
        // collision detected
        console.log("collision");
        // restore position
        controller.position.x = lastNotCollidingPositionX;
        controller.position.z = lastNotCollidingPositionZ;

        // console.log("last not colligind pos: " +lastNotCollidingPositionX +"actual pos: " +controller.position.x );
      } else if ((collisionResults.length > 0) && (collisionResults[0].distance > directionVector.length())) {
        // no collision detected -> save position
        lastNotCollidingPositionX = controller.position.x;
        lastNotCollidingPositionZ = controller.position.z;
        // console.log("last not colligind pos: " +lastNotCollidingPositionX);
      }
    }
  }
  
};