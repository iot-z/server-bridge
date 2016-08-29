import ServerUser from 'socket.io';
import ServerModule from './ServerModule';
import ServerHttp from 'express';

let serverHttp    = new ServerHttp();
let serverUser    = new ServerUser(3000);
let serverModule  = new ServerModule(4123);

let Bridge = {
  modules: {},
  users: {}
};

serverModule.on('connection', (client) => {
  client.on('setDevice', (id, type, version) => {
    console.log(id, type, version);

    IoTz.modules[id] = {
      type:     type,
      version:  version,
      instance: client
    }
  });
});

serverUser.on('connection', (client) => {
  client.on('disconnect', function () {
    console.log('user disconnected');
  });

  client.on('send', () => {

  });

  client.on('ask', () => {

  });
});

serverHttp.use(ServerHttp.static('public'));
