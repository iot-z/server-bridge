const { DriverDefault, HIGH, LOW } = require('./driver-default');
const pins = require('./utils/node-mcu.js');

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
