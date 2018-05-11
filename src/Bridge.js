'use strict';

const ServerUser   = require('socket.io');
const ServerHttp   = require('express');
const ServerModule = require('./ServerModule');

// let serverHttp     = new ServerHttp();
let serverUser     = new ServerUser(3000);
let serverModule   = new ServerModule(4000);

serverModule.on('connection', (client) => {
    console.log('Module connected:', client.id, client.name, client.type, client.version);

    client.on('disconnect', () => {
      console.log('Module disconnected');
    });

    serverUser.emit('data', serverModule.data);
});

serverUser.on('connection', (client) => {
  console.log('User conected');

  client.on('disconnect', () => {
    console.log('User disconnected');
  });

  client.on('change', (playload) => {
    serverModule.getClient(playload.moduleId).state.set(playload.prop, playload.val);
  });

  client.emit('data', serverModule.data);
});

// serverHttp.use(ServerHttp.static('public'));
