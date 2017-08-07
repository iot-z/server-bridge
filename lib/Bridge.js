'use strict';

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _ServerModule = require('./ServerModule');

var _ServerModule2 = _interopRequireDefault(_ServerModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// let serverHttp    = new ServerHttp();
var serverUser = new _socket2.default(3000);
var serverModule = new _ServerModule2.default(4000);

serverModule.on('connection', function (client) {
  console.log('Module connected:', client.id, client.name, client.type, client.version);
});

serverUser.on('connection', function (client) {
  console.log('connection');

  client.on('disconnect', function () {
    console.log('user disconnected');
  });

  client.on('send', function (playload) {
    var module = serverModule.getClient(playload.moduleId);
    module.ask(playload.topic, playload.data).then(function (data) {
      client.emit(playload.id, data);
    });
  });

  client.on('get-list-modules', function () {
    client.emit('list-modules', serverModule.clients);
  });
});

// serverHttp.use(ServerHttp.static('public'));