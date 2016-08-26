import ModuleCore from './ModuleCore';

export const INPUT          = 'INPUT';
export const OUTPUT         = 'OUTPUT';
// export const INPUT_PULLUP   = 'INPUT_PULLUP';
export const HIGH           = '1';
export const LOW            = '0';
export const CONNECTED      = 'CONNECTED';
export const DISCONNECTED   = 'DISCONNECTED';
export const DEFAULT        = 'DEFAULT';
export const EXTERNAL       = 'EXTERNAL';
export const INTERNAL       = 'INTERNAL';
export const MSBFIRST       = 'MSBFIRST';
export const LSBFIRST       = 'LSBFIRST';

export default class Module extends ModuleCore {
  /**
  * Constructor
  * @param  {string} id
  * @param  {string} type
  * @param  {string} version
  * @param  {ServerClient} client
  * @return {void}
  */
  constructor(id, type, version, client) {
    super(id, type, version, client);

    this._valuesPinMode         = [INPUT, OUTPUT];
    this._valuesDigitalLevel    = [HIGH, LOW];
    this._valuesAnalogReference = [DEFAULT, EXTERNAL, INTERNAL];
    this._valuesBitOrder        = [MSBFIRST, LSBFIRST];
  }

  // Digital I/O
  /**
  * Configures the specified pin to behave either as an input or an output.
  * @param  {integer} pin
  * @param  {[INPUT, OUTPUT]} mode
  * @return {void}
  */
  pinMode(pin, mode) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }
    if (this._valuesPinMode.indexOf(mode) === -1) { throw new Error('Invalid value of param "mode": ' + mode); }

    return this.client.send('pinMode', {pin: pin, mode: mode});
  }

  /**
  * Write a HIGH or a LOW value to a digital pin.
  * @param  {integer} pin
  * @param  {[HIGH, LOW]} level
  * @return {void}
  */
  digitalWrite(pin, level) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }
    if (this._valuesDigitalLevel.indexOf(level) === -1) { throw new Error('Invalid value of param "level": ' + level); }

    return this.client.send('digitalWrite', {pin: pin, level: level});
  }

  /**
  * Reads the value from a specified digital pin, either HIGH or LOW.
  * @param  {integer} pin
  * @return {Promise}
  */
  digitalRead(pin) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

    return this.client.ask('digitalRead', {pin: pin});
  }

  // Analog I/O
  /**
  * Configures the reference voltage used for analog input (i.e. the value used as the top of the input range).
  * @param  {[DEFAULT, EXTERNAL, INTERNAL]} type
  * @return {void}
  */
  analogReference(value) {
    if (this._valuesAnalogReference.indexOf(mode) === -1) { throw new Error('Invalid value of param "value": ' + value); }

    return this.client.send('analogReference', {value: value});
  }

  /**
  * Reads the value from the specified analog pin.
  * @param  {integer} pin
  * @return {Promise} int (0 to 1023)
  */
  analogRead(pin) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

    return this.client.ask('analogRead', {pin: pin});
  }

  /**
  * Writes an analog value (PWM wave) to a pin.
  * @param  {integer} pin
  * @param  {integer} value
  * @return {void}
  */
  analogWrite(pin, value) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

    return this.client.send('analogWrite', {pin: pin, value: value});
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
  tone(pin, frequency, duration) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

    return this.client.send('tone', {pin: pin, frequency: frequency, duration: duration});
  }

  /**
  * Stops the generation of a square wave triggered by tone(). Has no effect if no tone is being generated.
  * @param  {integer} pin
  * @return {void}
  */
  noTone(pin) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }

    return this.client.send('noTone', {pin: pin});
  }

  /**
  * Shifts out a byte of data one bit at a time.
  * @param  {integer} dataPin
  * @param  {integer} clockPin
  * @param  {[MSBFIRST, LSBFIRST]} bitOrder
  * @param  {byte} value
  * @return {void}
  */
  shiftOut(dataPin, clockPin, bitOrder, value) {
    if (typeof dataPin !== 'number') { throw new TypeError('The param "dataPin" must be a number'); }
    if (typeof clockPin !== 'number') { throw new TypeError('The param "clockPin" must be a number'); }
    if (this._valuesBitOrder.indexOf(bitOrder) === -1) { throw new Error('Invalid value of param "bitOrder": ' + bitOrder); }

    return this.client.send('shiftOut', {dataPin: dataPin, clockPin: clockPin, bitOrder: bitOrder, value: value});
  }

  /**
  * Shifts in a byte of data one bit at a time.
  * @param  {integer} dataPin
  * @param  {integer} clockPin
  * @param  {[MSBFIRST, LSBFIRST]} bitOrder
  * @return {Promise}
  */
  shiftIn(dataPin, clockPin, bitOrder) {
    if (typeof dataPin !== 'number') { throw new TypeError('The param "dataPin" must be a number'); }
    if (typeof clockPin !== 'number') { throw new TypeError('The param "clockPin" must be a number'); }
    if (this._valuesBitOrder.indexOf(bitOrder) === -1) { throw new Error('Invalid value of param "bitOrder": ' + bitOrder); }

    return this.client.ask('shiftIn', {dataPin: dataPin, clockPin: clockPin, bitOrder: bitOrder});
  }

  /**
  * Reads a pulse (either HIGH or LOW) on a pin.
  * @param  {integer} pin
  * @param  {[HIGH, LOW]} value
  * @param  {long} [timeout]     the number of microseconds to wait for the pulse to be completed
  * @return {Promise}
  */
  pulseIn(pin, value, timeout) {
    if (typeof pin !== 'number') { throw new TypeError('The param "pin" must be a number'); }
    if (this._valuesDigitalLevel.indexOf(value) === -1) { throw new Error('Invalid value of param "value": ' + value); }

    return this.client.ask('pulseIn', {pin: pin, value: value, timeout: timeout});

    return d.promise;
  }
}
