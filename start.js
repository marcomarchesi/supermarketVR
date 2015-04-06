/* supermarketVR */


var express = require('express');
var glove = require('./Glove.js');
var neurosky  = require('node-neurosky');
var app = express();
var port = 8080;

app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));

// app.listen(port);
console.log("listening port " + port);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});



/* Neurosky recording data */
var client = neurosky.createClient({
    appName: 'supermarketVR',
    appKey: '123123123123'
});
client.on('data',function(data){

  /* good signal acquired */
  if (data.poorSignalLevel==0) {
    io.sockets.emit('neurosky',data);
  }

});
client.connect();