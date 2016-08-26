import Q from 'q';
import {EventEmitter} from 'events';

const MAX_MESSAGE_ID = 255;
let MESSAGE_ID = 0;

export default class ModuleCore extends EventEmitter {
  /**
  * Constructor
  * @param  {string} IP
  * @return {void}
  */
  constructor(id, type, version, client) {
    super();

    this._id      = id;
    this._type    = type;
    this._version = version;
    this._client  = client;

    this._client.on('*', (topic, data) => {
      this.emit(topic, data);
    });
  }

  /**
  * Get instance of the client
  * @return {Client} Client instance
  */
  get client() {
    return this._client;
  }

  get id() {
    return this._id;
  }

  get type() {
    return this._type;
  }

  get version() {
    return this._version;
  }
}
