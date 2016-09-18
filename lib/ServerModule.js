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

var MAX_MESSAGE_ID = 65535; // uint16
var MESSAGE_ID = 0;

var Client = function (_EventEmitter) {
  _inherits(Client, _EventEmitter);

  function Client(server, host, port, id, type, version) {
    _classCallCheck(this, Client);

    var _this = _possibleConstructorReturn(this, (Client.__proto__ || Object.getPrototypeOf(Client)).call(this));

    _this._host = host;
    _this._port = port;
    _this._id = id;
    _this._type = type;
    _this._version = version;

    _this._time = Date.now();

    _this.server = server;
    return _this;
  }

  _createClass(Client, [{
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
    key: 'setTime',
    value: function setTime() {
      this._time = Date.now();
    }
  }, {
    key: 'time',
    get: function get() {
      return this._time;
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
  }, {
    key: 'id',
    get: function get() {
      return this._id;
    }
  }, {
    key: 'type',
    get: function get() {
      return this._type;
    }
  }, {
    key: 'version',
    get: function get() {
      return this._version;
    }
  }]);

  return Client;
}(_events.EventEmitter);

var Server = function (_EventEmitter2) {
  _inherits(Server, _EventEmitter2);

  function Server(port) {
    _classCallCheck(this, Server);

    var _this2 = _possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this));

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
      var client = _this2.getClient(payload.moduleId);

      if (!!client) {
        client.setTime();

        if (payload.topic == 'ping') {
          // Do nothing
        } else if (payload.topic == 'disconnect') {
          _this2.rmClient(payload.moduleId);
        } else {
          client.emit(payload.topic, payload.data);
          client.emit('*', payload.topic, payload.data);
          // this.emit(payload.topic, payload.data);
        }
      } else {
        if (payload.topic == 'connect') {
          _this2.newClient(rinfo.address, rinfo.port, payload.moduleId, payload.data.type, payload.data.version);
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

        if (now - client.time > _this2._pingDelay) {
          if (now - client.time < _this2._pingTimeOut) {
            client.send('ping');
          } else {
            console.log('timeout', client.id);
            _this2.rmClient(client.id);
          }
        }
      }
    }, 1000 / 30);
    return _this2;
  }

  _createClass(Server, [{
    key: 'newClient',
    value: function newClient(host, port, id, type, version) {
      var client = new Client(this, host, port, id, type, version);

      this._clients[id] = client;

      client.send('connect');
      this.emit('connection', client);
    }
  }, {
    key: 'getClient',
    value: function getClient(id) {
      return this._clients[id];
    }
  }, {
    key: 'rmClient',
    value: function rmClient(id) {
      var client = this._clients[id];

      client.send('disconnect');
      client.emit('disconected');

      delete this._clients[id];
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
          messageId = this._genMessageID(),
          buffer = new Buffer(JSON.stringify({ messageId: messageId, topic: topic, data: data }));

      client.once(messageId, function (data) {
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
  }, {
    key: 'clients',
    get: function get() {
      var c = [];

      for (var i in this._clients) {
        c.push({ id: this._clients[i].id, type: this._clients[i].type, version: this._clients[i].version });
      }

      return c;
    }
  }]);

  return Server;
}(_events.EventEmitter);

exports.default = Server;