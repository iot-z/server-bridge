'use strict';

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _Server = require('./Server');

var _Server2 = _interopRequireDefault(_Server);

var _Module = require('./Module');

var _Module2 = _interopRequireDefault(_Module);

var _NodeMCU = require('../utils/NodeMCU');

var _Helpers = require('../utils/Helpers');

var _Helpers2 = _interopRequireDefault(_Helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var io = new _socket2.default();
var s = new _Server2.default(4123);
var pin = _NodeMCU.D2;
var state = false;
var b = void 0;

s.on('connection', function (client) {
  console.log('new client');

  client.on('setDevice', function (ID, TYPE, VERSION) {
    console.log(ID, TYPE, VERSION);

    b = new _Module2.default(ID, TYPE, VERSION, client);

    b.pinMode(pin, _Module.OUTPUT);

    var p = 40;
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);
    b.digitalWrite(p++, state ? _Module.HIGH : _Module.LOW);

    _Helpers2.default.loop(1000, function () {
      console.time('t');

      b.digitalRead(pin).then(function (v) {
        console.timeEnd('t');
        console.log(v.level);
      });
    });
  });
});

io.on('connection', function (client) {
  client.on('toggle', function () {
    state = !state;
    b.digitalWrite(pin, state ? _Module.HIGH : _Module.LOW).then(function () {
      client.emit('response');
    });
  });
});
io.listen(3000);