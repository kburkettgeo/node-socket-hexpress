var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var moment = require('moment');
var io = require('socket.io')(http);

var _hexGame = new require('./server/hexGame.js').HexGame();

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/hexGame.html');
});

io.on('connection', function(socket){
    console.log('client connected');

    socket.on('hexGame', function(hexGame){

        _hexGame = hexGame;
        io.emit('hexGame', _hexGame);
    });

    io.emit('hexGame', _hexGame);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
