'use strict';

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _ServerModule = require('./ServerModule');

var _ServerModule2 = _interopRequireDefault(_ServerModule);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var serverHttp = new _express2.default();
var serverUser = new _socket2.default(3000);
var serverModule = new _ServerModule2.default(4000);

serverModule.on('connection', function (client) {
  console.log('Module connected:', client.id, client.type, client.version);
});

serverUser.on('connection', function (client) {
  client.on('disconnect', function () {
    console.log('user disconnected');
  });

  client.on('send', function (playload) {
    var module = serverModule.getClient(playload.module);
    module.send(playload.topic, playload.data);
  });

  client.on('ask', function (playload) {
    var module = serverModule.getClient(playload.module);
    module.ask(playload.topic, playload.data).then(function (data) {
      client.emit(playload.id, data);
    });
  });

  client.emit('list-modules', serverModule.clients);
});

serverHttp.use(_express2.default.static('public'));