//LOLCollision_spec.js
var assert = require("assert");
var lol = require('../public/js/LOLCollision.js');
var collision = new lol();

describe('LOLCollision', function(){

  describe('create', function(){
    it('should create a collision map', function(){
      
      var map = collision.create(10);
      assert.equal(0, map[0][0]);
      assert.equal(1, map[0][5]);
    });
  });
  describe('print', function(){
    it('should print the generated map', function(){
      var map = collision.create(10);
      collision.print(map);
    });
  });
  describe('detect',function(){
    it('should detect any collision around a position', function(){
      collision.create(10);
      assert.equal(1,collision.detect(15,25));
      assert.equal(0,collision.detect(0,49));
      assert.equal(1,collision.detect(50,49));
    });
  });

});