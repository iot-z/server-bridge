'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mqtt = require('mqtt');

var mqtt = _interopRequireWildcard(_mqtt);

var _events = require('events');

var _Board = require('./Board');

var _Board2 = _interopRequireDefault(_Board);

var _NodeMCU = require('../utils/NodeMCU');

var _Helpers = require('../utils/Helpers');

var _Helpers2 = _interopRequireDefault(_Helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var clients = {};

var server = http.createServer();

var ServerClient = function (_EventEmitter) {
  _inherits(ServerClient, _EventEmitter);

  function ServerClient(server, port, host) {
    _classCallCheck(this, ServerClient);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ServerClient).call(this));

    _this._host = host;
    _this._port = port;

    _this.server = server;
    return _this;
  }

  _createClass(ServerClient, [{
    key: 'send',
    value: function send(topic) {
      var _server;

      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        message[_key - 1] = arguments[_key];
      }

      return (_server = this.server).send.apply(_server, [this, topic].concat(message));
    }
  }, {
    key: 'host',
    get: function get() {
      return this._host;
    }
  }, {
    key: 'port',
    get: function get() {
      return this._port;
    }
  }]);

  return ServerClient;
}(_events.EventEmitter);

new mqtt.Server(function (client) {
  var self = this;

  if (!self.clients) self.clients = {};

  client.on('connect', function (packet) {
    self.clients[packet.clientId] = client;
    client.id = packet.clientId;
    console.log("CONNECT: client id: " + client.id);
    client.subscriptions = [];
    client.connack({ returnCode: 0 });

    clients[client.id] = client;

    var pin = _NodeMCU.D2;
    var b = new _Board2.default(client);
    var state = false;

    b.pinMode(pin, _Board.OUTPUT);

    b.digitalWrite(pin, (state = !state) ? _Board.HIGH : _Board.LOW);

    _Helpers2.default.repeat(3, 1000, function () {
      b.digitalWrite(pin, (state = !state) ? _Board.HIGH : _Board.LOW);
    });

    _Helpers2.default.loop(1000, function () {
      console.time('test');
      b.digitalRead(pin).then(function (v) {
        console.log(v);
        console.timeEnd('test');
      });
    });
  });

  client.on('subscribe', function (packet) {
    var granted = [];

    console.log("SUBSCRIBE(%s): %j", client.id, packet);

    for (var i = 0; i < packet.subscriptions.length; i++) {
      var qos = packet.subscriptions[i].qos,
          topic = packet.subscriptions[i].topic,
          reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$');

      granted.push(qos);
      client.subscriptions.push(reg);
    }

    client.suback({ messageId: packet.messageId, granted: granted });
  });

  client.on('publish', function (packet) {
    console.log("PUBLISH(%s): %j", client.id, packet);
    for (var k in self.clients) {
      var c = self.clients[k];

      for (var i = 0; i < c.subscriptions.length; i++) {
        var s = c.subscriptions[i];

        if (s.test(packet.topic)) {
          c.publish({ topic: packet.topic, payload: packet.payload });
          break;
        }
      }
    }
  });

  client.on('subscribe', function (packet) {
    // console.log("SUBSCRIBE(%s): %j", client.id, packet);

    var granted = [];
    for (var i = 0, l = packet.subscriptions.length; i < l; i++) {
      granted.push(packet.subscriptions[i].qos);
    }

    client.suback({ granted: granted, messageId: packet.messageId });
  });

  client.on('pingreq', function (packet) {
    console.log('PINGREQ(%s)', client.id);
    client.pingresp();
  });

  client.on('disconnect', function (packet) {
    client.stream.end();
  });

  client.on('close', function (packet) {
    delete self.clients[client.id];
  });

  client.on('error', function (e) {
    client.stream.end();
    console.log(e);
  });
}).listen(1883);