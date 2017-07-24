import ServerUser from 'socket.io';
import ServerHttp from 'express';
import ServerModule from './ServerModule';

// let serverHttp    = new ServerHttp();
let serverUser    = new ServerUser(3000);
let serverModule  = new ServerModule(4000);

serverModule.on('connection', (client) => {
    console.log('Module connected:', client.id, client.name, client.type, client.version);
});

serverUser.on('connection', (client) => {
  console.log('connection');

  client.on('disconnect', () => {
    console.log('user disconnected');
  });

  client.on('send', (playload) => {
    let module = serverModule.getClient(playload.moduleId);
    module.ask(playload.topic, playload.data).then((data) => {
      client.emit(playload.id, data);
    });
  });

  client.on('get-list-modules', () => {
    client.emit('list-modules', serverModule.clients);
  });
});

// serverHttp.use(ServerHttp.static('public'));
