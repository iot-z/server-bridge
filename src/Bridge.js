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

  client.on('send', (playload) => {
    let module = serverModule.getClient(playload.module);
    module.send(playload.topic, playload.data);
  });

  client.on('ask', (playload) => {
    let module = serverModule.getClient(playload.module);
    module.ask(playload.topic, playload.data).then((data) => {
      client.emit(playload.id, data);
    });
  });

  client.emmit('list-modules', serverModule.clients);
});

serverHttp.use(ServerHttp.static('public'));
