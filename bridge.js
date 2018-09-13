'use strict';

const path         = require('path');
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
    serverUser.emit('modules.modules', serverModule.modules);
  });

  client.on('modules.state', (playload) => {
    console.log('modules.state', playload);
    serverModule.get(playload.moduleId).state.set(playload.prop, playload.val);
  });

  client.on('modules.actions', (playload) => {
    console.log('modules.actions', playload);
    serverModule.get(playload.moduleId).actions[playload.action](playload.val);
  });

  client.emit('modules.aliases', [{ id: '12345', name: 'Teste' }]);
  client.emit('modules.modules', serverModule.modules);
  client.emit('modules.scenes', [{ id: '1234', name: 'Teste' }]);
});

serverModule.on('connection', (module) => {
  console.log('Module connected:', module.id, module.name, module.type, module.version);

  module.on('disconnect', () => {
    console.log('Module disconnected');

    serverUser.emit('modules.modules', serverModule.modules);
  });

  module.on('state', (prop, oldVal, val) => {
    console.log('state', prop, oldVal, val);
    serverUser.emit('modules.state', { moduleId: module.id, prop, val });
  });

  serverUser.emit('modules.modules', serverModule.modules);
});

serverHttp.get('/ui/:moduleId*?', (req, res) => {
  const moduleId = req.params.moduleId;
  const filename = req.params[0] ? req.params[0] : 'index.html';

  const module = serverModule.get(moduleId);

  if (typeof module !== 'undefined') { // Verificar se o moduleId existe
    const ui = module.ui.type;

    res.sendFile(filename, { root: path.join(__dirname, `./node_modules/${ui}`) });
  } else {
    res.sendStatus(404);
  }
});

serverHttp.get('/iotz.js', (req, res) => {
  res.sendFile('iotz.js', { root: path.join(__dirname, './node_modules/@iotz/iotz.js/dist') });
});

serverHttp.get('/*', (req, res) => {
  const filename = req.params[0] ? req.params[0] : 'index.html';
  res.sendFile(filename, { root: path.join(__dirname, './node_modules/@iotz/server-pwa/dist') });
});

serverHttp.listen(80);
serverUser.listen(3000);
serverModule.listen(4000);
