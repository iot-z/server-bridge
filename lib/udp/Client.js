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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Client = function (_EventEmitter) {
    _inherits(Client, _EventEmitter);

    function Client() {
        _classCallCheck(this, Client);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Client).call(this));

        _this.socket = _dgram2.default.createSocket('udp4');

        _this.socket.on('error', function (err) {
            console.log('client error:\n' + err.stack);
            _this.socket.close();
        });

        _this.socket.on('message', function (msg, rinfo) {
            // topic:message
            var data = msg.toString().split(/([^:]+):(.*)/),
                topic = data[1] ? data[1] : msg.toString(),
                params = data[2] ? data[2].split('|') : [];

            _this.emit.apply(_this, [topic].concat(_toConsumableArray(params)));
            _this.emit.apply(_this, ['message', topic].concat(_toConsumableArray(params)));
        });
        return _this;
    }

    _createClass(Client, [{
        key: 'send',
        value: function send(topic) {
            for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                message[_key - 1] = arguments[_key];
            }

            var d = _q2.default.defer(),
                buffer = new Buffer(topic + (message.length ? ':' + message.join('|') : ''));

            this.socket.send(buffer, 0, buffer.length, this.port, this.host, function (err) {
                if (err) d.reject(err);else d.resolve();
            });

            return d.promise;
        }
    }, {
        key: 'close',
        value: function close() {
            this.socket.close();
        }
    }, {
        key: 'connect',
        value: function connect(port, host) {
            this._host = host;
            this._port = port;

            return this.send('hi');
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

    return Client;
}(_events.EventEmitter);

exports.default = Client;