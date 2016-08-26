'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _dgram = require('dgram');

var _dgram2 = _interopRequireDefault(_dgram);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MAX_MESSAGE_ID = 255;
var MESSAGE_ID = 0;

var ServerClient = function (_EventEmitter) {
  _inherits(ServerClient, _EventEmitter);

  function ServerClient(server, host, port) {
    _classCallCheck(this, ServerClient);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ServerClient).call(this));

    _this._host = host;
    _this._port = port;

    _this._lastTalkTime = Date.now();

    _this.server = server;
    return _this;
  }

  _createClass(ServerClient, [{
    key: 'send',
    value: function send(topic, data) {
      return this.server.send(this, topic, data);
    }
  }, {
    key: 'ask',
    value: function ask(topic, data) {
      return this.server.ask(this, topic, data);
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

var Server = function (_EventEmitter2) {
  _inherits(Server, _EventEmitter2);

  function Server(port) {
    _classCallCheck(this, Server);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Server).call(this));

    _this2._port = port;
    _this2._clients = {};

    _this2._pingDelay = 50;
    _this2._pingTimeOut = 250;

    _this2.socket = _dgram2.default.createSocket('udp4');

    _this2.socket.on('error', function (err) {
      console.log('server error:\n' + err.stack);
      _this2.socket.close();
    });

    _this2.socket.on('message', function (buffer, rinfo) {
      var payload = JSON.parse(buffer.toString());
      var client = _this2.getClient(rinfo.address, rinfo.port);

      if (!!client) {
        client.lastTalkTime = Date.now();

        if (payload.topic == 'ping') {
          // Do nothing
        } else if (payload.topic == 'disconnect') {
          _this2.rmClient(client.instance.host, client.instance.port);
        } else {
          console.log(buffer.toString());
          client.instance.emit(payload.topic, payload.data);
          client.instance.emit('*', payload.topic, payload.data);
          // this.emit(payload.topic, payload.data);
        }
      } else {
        if (payload.topic == 'connect') {
          _this2.newClient(rinfo.address, rinfo.port);
        }
      }
    });

    _this2.socket.on('listening', function () {
      var address = _this2.socket.address();
      console.log('server listening ' + address.address + ':' + address.port);
    });

    _this2.socket.bind(_this2._port);

    setInterval(function () {
      var client = void 0,
          name = void 0;
      var now = Date.now();

      for (name in _this2._clients) {
        client = _this2._clients[name];

        if (now - client.lastTalkTime > _this2._pingDelay) {
          if (now - client.lastTalkTime < _this2._pingTimeOut) {
            client.instance.send('ping');
          } else {
            _this2.rmClient(client.instance.host, client.instance.port);
          }
        }
      }
    }, 1000 / 30);
    return _this2;
  }

  _createClass(Server, [{
    key: 'newClient',
    value: function newClient(host, port) {
      var client = {
        instance: new ServerClient(this, host, port),
        lastTalkTime: Date.now()
      };

      this._clients[host + ':' + port] = client;

      client.instance.send('connect');
      this.emit('connection', client.instance);
    }
  }, {
    key: 'getClient',
    value: function getClient(host, port) {
      return this._clients[host + ':' + port];
    }
  }, {
    key: 'rmClient',
    value: function rmClient(host, port) {
      var client = this._clients[host + ':' + port];

      client.instance.send('disconected');
      client.instance.emit('disconected');

      delete this._clients[host + ':' + port];
    }
  }, {
    key: 'send',
    value: function send(client, topic, data) {
      var d = _q2.default.defer(),
          buffer = new Buffer(JSON.stringify({ topic: topic, data: data }));

      this.socket.send(buffer, 0, buffer.length, client.port, client.host, function (err) {
        if (err) d.reject(err);
        d.resolve();
      });

      return d.promise;
    }
  }, {
    key: 'ask',
    value: function ask(client, topic, data) {
      var d = _q2.default.defer(),
          messageID = this._genMessageID(),
          buffer = new Buffer(JSON.stringify({ id: messageID, topic: topic, data: data }));

      client.once(messageID, function (data) {
        d.resolve(data);
      });

      this.socket.send(buffer, 0, buffer.length, client.port, client.host, function (err) {
        if (err) d.reject(err);
      });

      return d.promise;
    }

    /**
    * Genherate a message ID
    * @return {int} Message ID
    */

  }, {
    key: '_genMessageID',
    value: function _genMessageID() {
      MESSAGE_ID = ++MESSAGE_ID;
      MESSAGE_ID = MESSAGE_ID > MAX_MESSAGE_ID ? 0 : MESSAGE_ID;

      return MESSAGE_ID;
    }
  }, {
    key: 'close',
    value: function close() {
      this.socket.close();
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

  return Server;
}(_events.EventEmitter);

exports.default = Server;