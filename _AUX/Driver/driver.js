const { DriverDefault, HIGH, LOW } = require('./driver-default');
const pins = require('./utils/node-mcu.js');

class Driver extends DriverDefault {
  constructor(client) {
    super(client);

    this.state = {
      LED_BUILTIN: false,
    };

    this.actions = {
      on() {},
      off() {},
    };
  }

  async onChange(prop, oldVal, newVal) {
    console.log('onChange', prop, oldVal, newVal)
    // await this.digitalWrite(pins[prop], newVal ? HIGH : LOW);
  }

  async onCall(action, params) {
    console.log('onCall', action, params)
  }
}

module.exports.Driver = Driver;
