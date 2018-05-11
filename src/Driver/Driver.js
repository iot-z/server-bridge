const { DriverDefault, HIGH, LOW } = require('./DriverDefault');
const pins = require('./utils/NodeMCU.js');

class Driver extends DriverDefault {
  constructor(client) {
    super(client);

    this.state = {
      LED_BUILTIN: false,
    };
  }

  async onChange(prop, oldVal, newVal) {
    await this.digitalWrite(pins[prop], newVal ? HIGH : LOW);
  }
}

module.exports.Driver = Driver;
