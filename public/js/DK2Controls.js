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

// used to handle collisions
var canMoveUP = 1, canMoveDOWN = 1, canMoveRIGHT = 1, canMoveLEFT =1;

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
    }
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
        this.controller.setRotationFromMatrix(this.object.matrix);  
      }
      this.lastId = id;
    } 
    /* OCULUS OFF */
    else {

        var gloveQuaternion = new THREE.Quaternion();
        gloveQuaternion.setFromEuler(new THREE.Euler( 0, this.lookSpeed, 0, 'XYZ' ));
        /* transform camera and controller rotations */
        this.object.setRotationFromQuaternion(gloveQuaternion);
        this.controller.setRotationFromMatrix(this.object.matrix);  
    }

    // update position TODO here for rotate the cart ???
    if (this.wasd.up)
      this.controller.translateZ(-this.translationSpeed * delta * walkingFactor * canMoveUP);
    if (this.wasd.down)
      this.controller.translateZ(this.translationSpeed * delta * canMoveDOWN);
    if (this.wasd.right)
      this.controller.translateX(this.translationSpeed * delta * canMoveRIGHT);
    if (this.wasd.left)
      this.controller.translateX(-this.translationSpeed * delta * canMoveLEFT);

     //UNDER TEST
      // this.camera.rotation.y = -this.lookSpeed;
      //console.log("look speed is " + this.lookSpeed);   

    // both camera and object (camera's bounding box) need to be updated
    this.object.position.addVectors(this.controller.position, this.headPos);
    camera.position.addVectors(this.controller.position, this.headPos);
    cart_mesh.position.addVectors(this.controller.position, this.headPos);

    if(enableCollision) {
      canMoveLEFT =1;
      canMoveRIGHT=1;
      canMoveDOWN=1;
      canMoveUP=1;
      
      handleCollisions(this.controller, this.wasd.right, this.wasd.left, this.wasd.up, this.wasd.down);
    }

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

  function handleCollisions(controller, right, left, up, down) { 
    // Set the rays. One vector for every potential direction
    var rays = [
      new THREE.Vector3(0, 0, 1),   // up
      new THREE.Vector3(1, 0, 1),   // up left 
      new THREE.Vector3(1, 0, 0),   // left
      new THREE.Vector3(1, 0, -1),  // down left
      new THREE.Vector3(0, 0, -1),  // down
      new THREE.Vector3(-1, 0, -1), // down right
      new THREE.Vector3(-1, 0, 0),  // right
      new THREE.Vector3(-1, 0, 1)   // up right
    ];

    var caster = new THREE.Raycaster();
    var collisions, i;

    // Maximum distance from the origin before we consider collision
    distance = 0.5;
    // Get the obstacles array from our world
    obstacles = new Array();
    obstacles.push(boundingBoxMesh);

    // For each ray
    for (i = 0; i < rays.length; i += 1) {
      // We reset the raycaster to this direction
      caster.set(controller.position, rays[i]);
      // Test if we intersect with any obstacle mesh
      collisions = caster.intersectObjects(obstacles);
      // And disable that direction if we do
      if (collisions.length > 0 && collisions[0].distance <= distance) {
        if ((i === 0 || i === 1 || i === 7) && right) {
          console.log("collision right");
          canMoveRIGHT = 0;
        } else if ((i === 3 || i === 4 || i === 5) && left) {
          console.log("collision left");
          canMoveLEFT = 0;
        }
        if ((i === 1 || i === 2 || i === 3) && up) {
          console.log("collision up");
          canMoveUP = 0;
        } else if ((i === 5 || i === 6 || i === 7) && down) {
          console.log("collision down");
          canMoveDOWN = 0;
        }
      }


      // collisione parte frontale carrello
      // not working ..
      /*
      if (collisions.length > 0 && collisions[0].distance <= distance+2) {
        if ((i === 1 || i === 2 || i === 3) && up) {
          console.log("collision up2");
          canMoveUP = 0;
        } 
      }

      */

    }
  }


  // old method NOT WORKING WELL
  // function handleCollisions(movingObject, controller, right, left, up, down) {
    
  //   // collision detection:
  //   //   determines if any of the rays from the cube's origin to each vertex
  //   //   intersects any face of a mesh in the array of target meshes
  //   //   for increased collision accuracy, add more vertices to the cube;
  //   //   HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
    
  //   actualPosition = movingObject.position.clone();
  //   var objectsArray = new Array();
  //   objectsArray.push(boundingBoxMesh);
    
  //   for (var vertexIndex = 0; vertexIndex < movingObject.geometry.vertices.length; vertexIndex++) {   
  //     var localVertex = movingObject.geometry.vertices[vertexIndex].clone();
  //     var globalVertex = localVertex.applyMatrix4( movingObject.matrix );
  //     var directionVector = globalVertex.sub( movingObject.position );
      
  //     var ray = new THREE.Raycaster( actualPosition, directionVector.clone().normalize() );
  //     var collisionResults = ray.intersectObjects( objectsArray );
      
  //     // If the distance to an intersection is less than the distance between the Player's position and the geometry's vertex,
  //     // then the collision occurred on the interior of the player's mesh -- what we would probably call an "actual" collision.
  //     if ( (collisionResults.length > 0) && (collisionResults[0].distance < directionVector.length()) ) {
  //       // collision detected
  //       console.log("collision");
  //       // restore position
  //       controller.position.x = lastNotCollidingPositionX;
  //       controller.position.z = lastNotCollidingPositionZ;

  //       // movingObject.position.x = lastNotCollidingPositionX;
  //       // movingObject.position.z = lastNotCollidingPositionZ;

  //       // console.log("last not colligind pos: " +lastNotCollidingPositionX +"actual pos: " +controller.position.x );
  //     } else if ((collisionResults.length > 0) && (collisionResults[0].distance > directionVector.length())) {
  //       // no collision detected -> save position
  //       if(left)
  //         lastNotCollidingPositionX = controller.position.x+0.04;
  //       if(right)
  //         lastNotCollidingPositionX = controller.position.x-0.01;
  //       if(up)
  //         lastNotCollidingPositionZ = controller.position.z;
  //       if(down)
  //         lastNotCollidingPositionZ = controller.position.z;
  //       // console.log("last not colligind pos: " +lastNotCollidingPositionX);
  //     }
  //   }
  // }  
};