'use strict';

const serverHttp   = require('./servers/http');
const serverUser   = require('./servers/user');
const serverModule = require('./servers/module');

serverUser.on('connection', (client) => {
  console.log('User conected');

  client.on('disconnect', () => {
    console.log('User disconnected');
  });

  client.on('unregister', async (id) => {
    await serverModule.unregister(id);
    serverUser.emit('modules/modules', serverModule.modules);
  });

  client.on('change', (playload) => {
    serverModule.get(playload.moduleId).state.set(playload.prop, playload.val);
  });

  client.emit('modules/aliases', [{ id: '12345', name: 'Teste' }]);
  client.emit('modules/modules', serverModule.modules);
  client.emit('modules/scenes', [{ id: '1234', name: 'Teste' }]);
});

serverModule.on('connection', (module) => {
  console.log('Module connected:', module.id, module.name, module.type, module.version);

  module.on('disconnect', () => {
    console.log('Module disconnected');
    serverUser.emit('modules/modules', serverModule.modules);
  });

  serverUser.emit('modules/modules', serverModule.modules);
});

serverHttp.listen(80);
serverUser.listen(3000);
serverModule.listen(4000);
