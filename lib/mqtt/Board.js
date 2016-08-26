'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LSBFIRST = exports.MSBFIRST = exports.INTERNAL = exports.EXTERNAL = exports.DEFAULT = exports.DISCONNECTED = exports.CONNECTED = exports.LOW = exports.HIGH = exports.OUTPUT = exports.INPUT = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var INPUT = exports.INPUT = 'INPUT';
var OUTPUT = exports.OUTPUT = 'OUTPUT';
// export const INPUT_PULLUP   = 'INPUT_PULLUP';
var HIGH = exports.HIGH = '1';
var LOW = exports.LOW = '0';
var CONNECTED = exports.CONNECTED = 'CONNECTED';
var DISCONNECTED = exports.DISCONNECTED = 'DISCONNECTED';
var DEFAULT = exports.DEFAULT = 'DEFAULT';
var EXTERNAL = exports.EXTERNAL = 'EXTERNAL';
var INTERNAL = exports.INTERNAL = 'INTERNAL';
var MSBFIRST = exports.MSBFIRST = 'MSBFIRST';
var LSBFIRST = exports.LSBFIRST = 'LSBFIRST';

var MAX_MESSAGE_ID = 999999;
var MESSAGE_ID = 0;

var Board = function (_EventEmitter) {
    _inherits(Board, _EventEmitter);

    // Construct
    /**
     * Constructor
     * @param  {string} IP
     * @return {void}
     */
    function Board(client) {
        _classCallCheck(this, Board);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Board).call(this));

        _this._client = client;

        _this._valuesPinMode = [INPUT, OUTPUT];
        _this._valuesDigitalLevel = [HIGH, LOW];
        _this._valuesAnalogReference = [DEFAULT, EXTERNAL, INTERNAL];

        _this._client.on('publish', function (packet) {
            _this.emit(packet.topic, packet.payload.toString());
        });

        // Communication
        _this.Serial = {};
        _this.Stream = {};
        return _this;
    }

    /**
     * Get instance of the client MQTT
     * @return {Client} MQTT Client instance
     */


    _createClass(Board, [{
        key: 'genMessageID',


        /**
         * Genherate a message ID
         * @return {int} Message ID
         */
        value: function genMessageID() {
            MESSAGE_ID = ++MESSAGE_ID;
            MESSAGE_ID = MESSAGE_ID > MAX_MESSAGE_ID ? 0 : MESSAGE_ID;

            return MESSAGE_ID;
        }

        /**
         * Wait for a return to an action that requires response
         * @param  {string}   topic
         * @param  {function} cb
         * @return {void}
         */

    }, {
        key: 'await',
        value: function await(topic, cb) {
            this.once(topic, function (message) {
                cb(message);
            });
        }

        // Digital I/O
        /**
         * Configures the specified pin to behave either as an input or an output.
         * @param  {integer} pin
         * @param  {[INPUT, OUTPUT]} mode
         * @return {Promise}
         */

    }, {
        key: 'pinMode',
        value: function pinMode(pin, mode) {
            if (typeof pin !== 'number') {
                throw new TypeError('The param "pin" must be a number');
            }
            if (this._valuesPinMode.indexOf(mode) === -1) {
                throw new Error('Invalid value of param "mode": ' + mode);
            }

            if (this._status !== CONNECTED) {
                // Error
            }
        }

        /**
         * Write a HIGH or a LOW value to a digital pin.
         * @param  {integer} pin
         * @param  {[HIGH, LOW]} level
         * @return {Promise}
         */

    }, {
        key: 'digitalWrite',
        value: function digitalWrite(pin, level) {
            if (typeof pin !== 'number') {
                throw new TypeError('The param "pin" must be a number');
            }
            if (this._valuesDigitalLevel.indexOf(level) === -1) {
                throw new Error('Invalid value of param "level": ' + level);
            }

            this.client.publish('digitalWrite', pin + '|' + level);
        }

        /**
         * [digitalRead description]
         * @param  {integer} pin
         * @return {Promise}
         */

    }, {
        key: 'digitalRead',
        value: function digitalRead(pin, cb) {
            var d = _q2.default.defer(),
                messageID = void 0;

            if (typeof pin !== 'number') {
                throw new TypeError('The param "pin" must be a number');
            }

            messageID = this.genMessageID();

            this.await(messageID, function (message) {
                d.resolve(message);
            });

            this.client.publish({ topic: 'digitalRead', payload: messageID + '|' + pin });

            return d.promise;
        }

        // Analog I/O
        /**
         * @param  {[DEFAULT, EXTERNAL, INTERNAL]} type
         * @return {Promise}
         */

    }, {
        key: 'analogReference',
        value: function analogReference(type) {
            var d = _q2.default.defer();

            if (this._valuesAnalogReference.indexOf(mode) === -1) {
                throw new Error('Invalid value of param "type": ' + type);
            }

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }

        /**
         * @param  {integer} pin
         * @return {Promise} int (0 to 1023)
         */

    }, {
        key: 'analogRead',
        value: function analogRead(pin) {
            var d = _q2.default.defer();

            if (typeof pin !== 'number') {
                throw new TypeError('The param "pin" must be a number');
            }

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }

        /**
         * Writes an analog value (PWM wave) to a pin.
         * @param  {integer} pin
         * @param  {integer} value
         * @return {Promise}
         */

    }, {
        key: 'analogWrite',
        value: function analogWrite(pin, value) {
            var d = _q2.default.defer();

            if (typeof pin !== 'number') {
                throw new TypeError('The param "pin" must be a number');
            }

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }

        // Advanced I/O

    }, {
        key: 'tone',
        value: function tone() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'noTone',
        value: function noTone() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'shiftOut',
        value: function shiftOut() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'shiftIn',
        value: function shiftIn() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'pulseIn',
        value: function pulseIn() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }

        // Time

    }, {
        key: 'millis',
        value: function millis() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'micros',
        value: function micros() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'delay',
        value: function delay() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'delayMicroseconds',
        value: function delayMicroseconds() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }

        // Bits and Bytes

    }, {
        key: 'lowByte',
        value: function lowByte() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'highByte',
        value: function highByte() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'bitRead',
        value: function bitRead() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'bitWrite',
        value: function bitWrite() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'bitSet',
        value: function bitSet() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'bitClear',
        value: function bitClear() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'bit',
        value: function bit() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }

        // External Interrupts

    }, {
        key: 'attachInterrupt',
        value: function attachInterrupt() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'detachInterrupt',
        value: function detachInterrupt() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }

        // Interrupts

    }, {
        key: 'interrupts',
        value: function interrupts() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'noInterrupts',
        value: function noInterrupts() {
            var d = _q2.default.defer();

            if (this._status == CONNECTED) {
                setTimeout(function () {
                    d.resolve();
                }, 0);
            } else {
                setTimeout(function () {
                    d.reject();
                }, 0);
            }

            return d.promise;
        }
    }, {
        key: 'client',
        get: function get() {
            return this._client;
        }
    }]);

    return Board;
}(_events.EventEmitter);

exports.default = Board;