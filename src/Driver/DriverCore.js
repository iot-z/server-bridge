const EventEmitter = require('events');

class DriverCore extends EventEmitter {
  /**
  * Constructor
  * @param  {string} IP
  * @return {void}
  */
  constructor(client) {
    super();

    this._client  = client;

    this._client.on('*', (topic, data) => {
      this.emit(topic, data);
    });

    this.state = {};
  }

  /**
  * Get instance of the client
  * @return {Client} Client instance
  */
  get client() {
    return this._client;
  }

  get id() {
    return this._client.id;
  }

  get name() {
    return this._client.name;
  }

  get type() {
    return this._client.type;
  }

  get version() {
    return this._client.version;
  }
}

module.exports = DriverCore;
