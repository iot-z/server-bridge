const EventEmitter   = require('events');
const dgram          = require('dgram');
const DB             = require('../utils/db');
const { Driver }     = require('../driver/driver');
const { MakeObservable, MakeObservableFn } = require('../utils/make-observable');

const MAX_MESSAGE_ID = 65535; // uint16
let MESSAGE_ID       = 0;

class Module extends EventEmitter {
  constructor(server, id, data) {
    super();

    this._host         = null;
    this._port         = null;

    this._id           = id;
    this._name         = data.name;
    this._type         = data.type;
    this._version      = data.version;

    this._created_at   = data.created_at;
    this._connected_at = data.connected_at;
    this._status       = data.status || true;

    this._driver       = {
      id: data.driver || null,
      version: null,
      instance: new Driver(this),
    };

    this._ui           = {
      id: data.ui || null,
      version: null,
      instance: null,
    };

    // this._driver.state = MakeObservable(driver.state, driver.onChange.bind(driver), true);

    this._connected    = false;

    this.server        = server;
  }

  async connect(host, port) {
    this._host        = host;
    this._port        = port;
    this._connected   = true;

    this.setTime();

    await this.send('connect', { timeout: this.server._connectionTimeOut });
    this.server.emit('connection', this);
  }

  async disconnect() {
    clearInterval(this._intervalPing);
    clearTimeout(this._timeoutConnetcion);

    await this.send('disconnect');

    this._host         = null;
    this._port         = null;
    this._connected    = false;

    this.emit('disconnect');
  }

  async send(topic, data) {
    return await this.server.send(this, topic, data);
  }

  setTime() {
    this._time = Date.now();

    clearInterval(this._intervalPing);
    clearTimeout(this._timeoutConnetcion);

    this._intervalPing = setInterval(() => {
      this.send('ping');
    }, this.server._pingDelay);

    this._timeoutConnetcion = setTimeout(() => {
      console.log('timeout connetcion', this.id);
      this.disconnect();
    }, this.server._connectionTimeOut);
  }

  get state() {
    return this._driver.instance.state;
  }

  get actions() {
    return this._driver.instance.actions;
  }

  get time() {
    return this._time;
  }

  get host() {
    return this._host;
  }

  get port() {
    return this._port;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get type() {
    return this._type;
  }

  get version() {
    return this._version;
  }

  get connected() {
    return this._connected;
  }

  get status() {
    return this._status;
  }
}

class Server extends EventEmitter {
  constructor(port) {
    super();

    this._pingDelay         = 5000;
    this._messageTries      = 3;
    this._messageTimeOut    = 1000;
    this._connectionTimeOut = 16000;

    this._port              = port;
    this._modules           = {};

    this.db                 = new DB('./iotz.db');
    this.socket             = dgram.createSocket('udp4');
  }

  async init() {
    await this.initModules();
    await this.initSocket();
  }

  async initModules() {
    const rows = await this.db.all('SELECT * FROM modules');

    rows.forEach((row) => {
      const { id, ...data } = row;
      this._modules[id] = this.add(id, data);
    });
  }

  initSocket() {
    return new Promise((resolve, reject) => {
      this.socket.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        this.socket.close();
        reject();
      });

      this.socket.on('message', async (buffer, rinfo) => {
        const payload = JSON.parse(buffer.toString());
        let module = this.get(payload.moduleId);

        if (!module && payload.topic == 'connect') {
          module = await this.register(payload.moduleId, payload.data);
        }

        if (!!module) {
          if (payload.topic == 'connect') {
            await module.connect(rinfo.address, rinfo.port);
          } else if (module.connected) {
            if (payload.topic == 'disconnect') {
              await module.disconnect();
            } else {
              module.setTime(); // Update the time of last packet received
              module.emit(payload.topic, payload.data);
              module.emit('*', payload.topic, payload.data);
              this.emit(`${payload.moduleId}.${payload.topic}`, payload.data);
            }
          }
        }
      });

      this.socket.on('listening', () => {
        const address = this.socket.address();
        console.log(`server listening ${address.address}:${address.port}`);

        resolve();
      });

      this.socket.bind(this._port);
    });
  }

  async register(id, data) {
    await this.db.run('INSERT INTO modules (id, name, type, version) VALUES (?, ?, ?, ?)', [id, ...Object.values(data)]);
    return this.add(id, data);
  }

  async unregister(id) {
    await this.db.run('DELETE FROM modules WHERE id = ?', id);
    this.rm(id);
  }

  add(id, data) {
    const module = new Module(this, id, data);

    this._modules[id] = module;

    return module;
  }

  rm(id) {
    const module = this._modules[id];

    module.disconnect();

    delete this._modules[id];
  }

  get(id) {
    return this._modules[id];
  }

  send(module, topic, data) {
    return new Promise((resolve, reject) => {
      const messageId = this._genMessageID();
      const buffer    = new Buffer(JSON.stringify({ messageId: messageId, topic: topic, data: data }));

      const _reject   = (...params) => {
        console.log('reject', module.id, topic, data, ...params);

        module.removeAllListeners(messageId);
        resolve(null);
      };

      let tries = this._messageTries;
      let timeout;

      module.once(messageId, (data) => {
        clearTimeout(timeout);
        resolve(data);
      });

      const send = () => {
        if (!module.connected) {
          _reject();

          return false;
        }

        this.socket.send(buffer, 0, buffer.length, module.port, module.host, (err) => {
          if (err) {
            _reject(err);
          } else {
            timeout = setTimeout(() => {
              if (--tries) {
                send();
              } else {
                _reject();
              }
            }, this._messageTimeOut);
          }
        });
      }

      send();
    });
  }

  /**
  * Generate a message ID
  * @return {int} Message ID
  */
  _genMessageID() {
    MESSAGE_ID = ++MESSAGE_ID;
    MESSAGE_ID = MESSAGE_ID > MAX_MESSAGE_ID ? 0 : MESSAGE_ID;

    return MESSAGE_ID;
  }

  close() {
    this.socket.close();
  }

  get port() {
    return this._port;
  }

  get modules() {
    let list = [];
    let module;

    for (let i in this._modules) {
      module = this._modules[i];

      list.push({
        id: module.id,
        name: module.name,
        type: module.type,
        version: module.version,
        connected: module.connected,
        status: module.status,
        state: module.state,
        actions: module.actions,
      });
    }

    return list;
  }
}

module.exports = Server;
