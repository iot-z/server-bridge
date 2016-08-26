'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LSBFIRST = exports.MSBFIRST = exports.INTERNAL = exports.EXTERNAL = exports.DEFAULT = exports.DISCONNECTED = exports.CONNECTED = exports.LOW = exports.HIGH = exports.OUTPUT = exports.INPUT = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ModuleCore2 = require('./ModuleCore');

var _ModuleCore3 = _interopRequireDefault(_ModuleCore2);

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

var Module = function (_ModuleCore) {
  _inherits(Module, _ModuleCore);

  /**
  * Constructor
  * @param  {string} id
  * @param  {string} type
  * @param  {string} version
  * @param  {ServerClient} client
  * @return {void}
  */
  function Module(id, type, version, client) {
    _classCallCheck(this, Module);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Module).call(this, id, type, version, client));

    _this._valuesPinMode = [INPUT, OUTPUT];
    _this._valuesDigitalLevel = [HIGH, LOW];
    _this._valuesAnalogReference = [DEFAULT, EXTERNAL, INTERNAL];
    _this._valuesBitOrder = [MSBFIRST, LSBFIRST];
    return _this;
  }

  // Digital I/O
  /**
  * Configures the specified pin to behave either as an input or an output.
  * @param  {integer} pin
  * @param  {[INPUT, OUTPUT]} mode
  * @return {void}
  */


  _createClass(Module, [{
    key: 'pinMode',
    value: function pinMode(pin, mode) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }
      if (this._valuesPinMode.indexOf(mode) === -1) {
        throw new Error('Invalid value of param "mode": ' + mode);
      }

      return this.client.send('pinMode', { pin: pin, mode: mode });
    }

    /**
    * Write a HIGH or a LOW value to a digital pin.
    * @param  {integer} pin
    * @param  {[HIGH, LOW]} level
    * @return {void}
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

      return this.client.send('digitalWrite', { pin: pin, level: level });
    }

    /**
    * Reads the value from a specified digital pin, either HIGH or LOW.
    * @param  {integer} pin
    * @return {Promise}
    */

  }, {
    key: 'digitalRead',
    value: function digitalRead(pin) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }

      return this.client.ask('digitalRead', { pin: pin });
    }

    // Analog I/O
    /**
    * Configures the reference voltage used for analog input (i.e. the value used as the top of the input range).
    * @param  {[DEFAULT, EXTERNAL, INTERNAL]} type
    * @return {void}
    */

  }, {
    key: 'analogReference',
    value: function analogReference(value) {
      if (this._valuesAnalogReference.indexOf(mode) === -1) {
        throw new Error('Invalid value of param "value": ' + value);
      }

      return this.client.send('analogReference', { value: value });
    }

    /**
    * Reads the value from the specified analog pin.
    * @param  {integer} pin
    * @return {Promise} int (0 to 1023)
    */

  }, {
    key: 'analogRead',
    value: function analogRead(pin) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }

      return this.client.ask('analogRead', { pin: pin });
    }

    /**
    * Writes an analog value (PWM wave) to a pin.
    * @param  {integer} pin
    * @param  {integer} value
    * @return {void}
    */

  }, {
    key: 'analogWrite',
    value: function analogWrite(pin, value) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }

      return this.client.send('analogWrite', { pin: pin, value: value });
    }

    // Advanced I/O
    /**
    * Generates a square wave of the specified frequency (and 50% duty cycle) on a pin.
    * A duration can be specified, otherwise the wave continues until a call to noTone(). The pin can be connected to a piezo buzzer or other speaker to play tones.
    * @param  {integer} pin
    * @param  {integer} frequency
    * @param  {long} [duration]     the duration of the tone in milliseconds (optional)
    * @return {void}
    */

  }, {
    key: 'tone',
    value: function tone(pin, frequency, duration) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }

      return this.client.send('tone', { pin: pin, frequency: frequency, duration: duration });
    }

    /**
    * Stops the generation of a square wave triggered by tone(). Has no effect if no tone is being generated.
    * @param  {integer} pin
    * @return {void}
    */

  }, {
    key: 'noTone',
    value: function noTone(pin) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }

      return this.client.send('noTone', { pin: pin });
    }

    /**
    * Shifts out a byte of data one bit at a time.
    * @param  {integer} dataPin
    * @param  {integer} clockPin
    * @param  {[MSBFIRST, LSBFIRST]} bitOrder
    * @param  {byte} value
    * @return {void}
    */

  }, {
    key: 'shiftOut',
    value: function shiftOut(dataPin, clockPin, bitOrder, value) {
      if (typeof dataPin !== 'number') {
        throw new TypeError('The param "dataPin" must be a number');
      }
      if (typeof clockPin !== 'number') {
        throw new TypeError('The param "clockPin" must be a number');
      }
      if (this._valuesBitOrder.indexOf(bitOrder) === -1) {
        throw new Error('Invalid value of param "bitOrder": ' + bitOrder);
      }

      return this.client.send('shiftOut', { dataPin: dataPin, clockPin: clockPin, bitOrder: bitOrder, value: value });
    }

    /**
    * Shifts in a byte of data one bit at a time.
    * @param  {integer} dataPin
    * @param  {integer} clockPin
    * @param  {[MSBFIRST, LSBFIRST]} bitOrder
    * @return {Promise}
    */

  }, {
    key: 'shiftIn',
    value: function shiftIn(dataPin, clockPin, bitOrder) {
      if (typeof dataPin !== 'number') {
        throw new TypeError('The param "dataPin" must be a number');
      }
      if (typeof clockPin !== 'number') {
        throw new TypeError('The param "clockPin" must be a number');
      }
      if (this._valuesBitOrder.indexOf(bitOrder) === -1) {
        throw new Error('Invalid value of param "bitOrder": ' + bitOrder);
      }

      return this.client.ask('shiftIn', { dataPin: dataPin, clockPin: clockPin, bitOrder: bitOrder });
    }

    /**
    * Reads a pulse (either HIGH or LOW) on a pin.
    * @param  {integer} pin
    * @param  {[HIGH, LOW]} value
    * @param  {long} [timeout]     the number of microseconds to wait for the pulse to be completed
    * @return {Promise}
    */

  }, {
    key: 'pulseIn',
    value: function pulseIn(pin, value, timeout) {
      if (typeof pin !== 'number') {
        throw new TypeError('The param "pin" must be a number');
      }
      if (this._valuesDigitalLevel.indexOf(value) === -1) {
        throw new Error('Invalid value of param "value": ' + value);
      }

      return this.client.ask('pulseIn', { pin: pin, value: value, timeout: timeout });

      return d.promise;
    }
  }]);

  return Module;
}(_ModuleCore3.default);

exports.default = Module;