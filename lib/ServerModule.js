'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _dgram = require('dgram');

var _dgram2 = _interopRequireDefault(_dgram);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MAX_MESSAGE_ID = 65535; // uint16
var MESSAGE_ID = 0;

var Client = function (_EventEmitter) {
  _inherits(Client, _EventEmitter);

  function Client(server, host, port, id, name, type, version) {
    _classCallCheck(this, Client);

    var _this = _possibleConstructorReturn(this, (Client.__proto__ || Object.getPrototypeOf(Client)).call(this));

    _this._host = host;
    _this._port = port;
    _this._id = id;
    _this._name = name;
    _this._type = type;
    _this._version = version;

    _this.setTime();

    _this.server = server;
    return _this;
  }

  _createClass(Client, [{
    key: 'send',
    value: function send(topic, data) {
      return this.server.send(this, topic, data);
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
    key: 'name',
    get: function get() {
      return this._name;
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

    _this2._pingDelay = 7000;
    _this2._pingTimeOut = 15000;
    _this2._messageTimeOut = 5000;

    _this2.socket = _dgram2.default.createSocket('udp4');

    _this2.socket.on('error', function (err) {
      console.log('server error:\n' + err.stack);
      _this2.socket.close();
    });

    _this2.socket.on('message', function (buffer, rinfo) {
      var payload = JSON.parse(buffer.toString());
      var client = _this2.getClient(payload.moduleId);

      if (!!client) {
        client.setTime(); // Update the time of last packet received

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
          _this2.newClient(rinfo.address, rinfo.port, payload.moduleId, payload.data.name, payload.data.type, payload.data.version);
        }
      }
    });

    _this2.socket.on('listening', function () {
      var address = _this2.socket.address();
      console.log('server listening ' + address.address + ':' + address.port);
    });

    _this2.socket.bind(_this2._port);

    setInterval(function () {
      var now = Date.now();
      var client = void 0,
          name = void 0,
          passed = void 0;

      for (name in _this2._clients) {
        client = _this2._clients[name];

        passed = now - client.time;

        if (passed > _this2._pingDelay) {
          if (passed < _this2._pingTimeOut) {
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
    value: function newClient(host, port, id, name, type, version) {
      var client = new Client(this, host, port, id, name, type, version);

      this._clients[id] = client;

      client.send('connect', { timeout: this._pingTimeOut });
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
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(client, topic, data) {
        var _this3 = this;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return new Promise(function (resolve, reject) {
                  var messageId = _this3._genMessageID();
                  var buffer = new Buffer(JSON.stringify({ messageId: messageId, topic: topic, data: data }));
                  var timeout = void 0;

                  client.once(messageId, function (data) {
                    clearTimeout(timeout);
                    resolve(data);
                  });

                  _this3.socket.send(buffer, 0, buffer.length, client.port, client.host, function (err) {
                    if (err) {
                      reject(err);
                    } else {
                      timeout = setTimeout(function () {
                        client.removeListener(messageId);
                        reject(err);
                      }, _this3._messageTimeOut);
                    }
                  });
                });

              case 2:
                return _context.abrupt('return', _context.sent);

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function send(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return send;
    }()

    /**
    * Generate a message ID
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
    key: 'port',
    get: function get() {
      return this._port;
    }
  }, {
    key: 'clients',
    get: function get() {
      var c = [];

      for (var i in this._clients) {
        c.push({ id: this._clients[i].id, name: this._clients[i].name, type: this._clients[i].type, version: this._clients[i].version });
      }

      return c;
    }
  }]);

  return Server;
}(_events.EventEmitter);

exports.default = Server;