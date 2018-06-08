'use strict';

const ServerUser   = require('socket.io');
const ServerHttp   = require('express');
const ServerModule = require('./server-module/server-module');

(async () => {
  // let serverHttp     = new ServerHttp();
  let serverUser     = new ServerUser(3000);
  let serverModule   = new ServerModule(4000);

  await serverModule.init();

  serverModule.on('connection', (client) => {
      console.log('Module connected:', client.id, client.name, client.type, client.version);

      client.on('disconnect', () => {
        console.log('Module disconnected');
      });

      serverUser.emit('modules/modules', serverModule.modules);
  });

  serverUser.on('connection', (client) => {
    console.log('User conected');

    client.on('disconnect', () => {
      console.log('User disconnected');
    });

    client.on('change', (playload) => {
      serverModule.getClient(playload.moduleId).state.set(playload.prop, playload.val);
    });

    client.emit('modules/aliases', [{ id: '12345', name: 'Teste' }]);
    client.emit('modules/modules', serverModule.modules);
    client.emit('modules/scenes', [{ id: '1234', name: 'Teste' }]);
  });

  // serverHttp.use(ServerHttp.static('public'));
})();
