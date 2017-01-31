import ServerUser from 'socket.io';
import ServerModule from './ServerModule';
import ServerHttp from 'express';

let serverHttp    = new ServerHttp();
let serverUser    = new ServerUser(3000);
let serverModule  = new ServerModule(4000);

serverModule.on('connection', (client) => {
    console.log('Module connected:', client.id, client.type, client.version);
});

serverUser.on('connection', (client) => {
  client.on('disconnect', function () {
    console.log('user disconnected');
  });

  client.on('send', (payload) => {
    let module = serverModule.getClient(payload.module);
    module.send(payload.topic, payload.data);
  });

  client.on('ask', (payload) => {
    let module = serverModule.getClient(payload.module);
    module.ask(payload.topic, payload.data).then((data) => {
      client.emit(payload.id, data);
    });
  });

  client.emit('list-modules', serverModule.clients);
});

serverHttp.use(ServerHttp.static('public'));
