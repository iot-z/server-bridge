const { DriverDefault, INPUT, OUTPUT, HIGH, LOW } = require('./DriverDefault');
const { D0, D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, SDA, SCL, LED_BUILTIN, BUILTIN_LED } = require('./utils/NodeMCU.js');

class Driver extends DriverDefault {
  constructor(client) {
    super(client);

    this.state = {
      D3: false,
    };

    this.pinMode(D3, OUTPUT);
  }

  handleChange(prop, oldVal, newVal) {
    this.digitalWrite(eval(prop), newVal ? HIGH : LOW);

    // try {
    //     this.digitalWrite(eval(prop), newVal ? HIGH : LOW);
    // } catch(e) {
    //     this.state.set(prop, oldVal);
    // }
  }

  destroy() {
    clearInterval(this.to);
  }
}

module.exports = Driver;
