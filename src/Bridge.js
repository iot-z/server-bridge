'use strict';

const ServerUser   = require('socket.io');
const ServerHttp   = require('express');
const ServerModule = require('./ServerModule');
const Driver       = require('./Driver/Driver');
const MakeObservable = require('./Driver/utils/MakeObservable');

// let serverHttp     = new ServerHttp();
let serverUser     = new ServerUser(3000);
let serverModule   = new ServerModule(4000);

let driver;

serverModule.on('connection', (client) => {
    console.log('Module connected:', client.id, client.name, client.type, client.version);

    driver = new Driver(client);
    driver.state = MakeObservable(driver.state, driver.handleChange.bind(driver), true);
});

serverUser.on('connection', (client) => {
  console.log('connection');

  client.on('disconnect', () => {
    console.log('user disconnected');
  });

  client.on('change', (playload) => {
    driver.state.set(playload.prop, playload.val);
  });

  client.emit('state', driver.state);
});

// serverHttp.use(ServerHttp.static('public'));
