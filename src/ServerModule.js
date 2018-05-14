const EventEmitter   = require('events');
const dgram          = require('dgram');
const DB             = require('./DB');
const { Driver }     = require('./Driver/Driver');
const { MakeObservable, MakeObservableFn } = require('./Driver/utils/MakeObservable');

const MAX_MESSAGE_ID = 65535; // uint16
let MESSAGE_ID       = 0;

class Module extends EventEmitter {
  constructor(server, data) {
    super();

    this._host         = null;
    this._port         = null;

    this._id           = data.id;
    this._name         = data.name;
    this._type         = data.type;
    this._version      = data.version;

    this._connected    = data.connected;
    this._created_at   = data.created_at;
    this._connected_at = data.connected_at;
    this._status       = data.status;

    this._driver       = {
      id: data.driver || null,
      version: null,
      instance: null
    };

    this._ui           = {
      id: data.ui || null,
      version: null,
      instance: null
    };

    this.server        = server;
  }

  async connect(host, port) {
    this._host        = host;
    this._port        = port;
    this._connected   = true;

    await this.send('connect', { timeout: this.server._connectionTimeOut });
    this.emit('connection', this);

    this.driver       = new Driver(this);
    this.driver.state = MakeObservable(this.driver.state, this.driver.onChange.bind(this.driver), true);

    this.setTime();
  }

  async disconnect() {
    await this.send('disconnect');
    this.emit('disconnect');

    this._host         = null;
    this._port         = null;
    this._connected    = false;
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
      console.log('timeout', this.id);
      this.server.rmClient(this.id);
    }, this.server._connectionTimeOut);
  }

  get state() {
    return this.driver.state;
  }

  get actions() {
    return this.driver.actions;
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
}

class Server extends EventEmitter {
  constructor(port) {
    super();

    this._pingDelay         = 5000;
    this._messageTries      = 3;
    this._messageTimeOut    = 1000;
    this._connectionTimeOut = 16000;

    this._port              = port;
    this._clients           = {};
    this._modules           = {};

    this.db                 = new DB('./iotz.db');
    this.socket             = dgram.createSocket('udp4');

    init();
  }

  async init() {
    await initModules();
    await initSocket();
  }

  async initModules() {
    const rows = await this.db.all('SELECT * FROM modules');

    rows.forEach((data) => {
      this._modules[data.id] = this.newModule(this, data);
    });
  }


  async initSocket() {
    return new Promise((resolve, reject) => {
      this.socket.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        this.socket.close();
        reject();
      });

      this.socket.on('message', (buffer, rinfo) => {
        const payload = JSON.parse(buffer.toString());
        const module = this.getModule(payload.moduleId);

        if (!!module) {
          if (payload.topic == 'connect' || payload.topic == 'disconnect') {
            await module.disconnect();
          } else {
            module.setTime(); // Update the time of last packet received
            module.emit(payload.topic, payload.data);
            module.emit('*', payload.topic, payload.data);
            this.emit(`${payload.moduleId}.${payload.topic}`, payload.data);
          }
        } else {
          if (payload.topic == 'connect') {
            await this.register(payload.moduleId, payload.data.name, payload.data.type, payload.data.version);

            await module.connect(rinfo.address, rinfo.port);
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

  async register(id, name, type, version) {
    const data = {
      id,
      name,
      type,
      version,
    };

    await this.db.run('INSERT INTO modules (id, name, type, version) VALUES (?, ?, ?, ?)', Object.values(data));
    this._modules[id] = this.newModule(this, data);
  }

  async newClient(host, port, id, name, type, version) {
    const client = new Client(this, host, port, id, name, type, version);

    this._clients[id] = client;

    await client.connect();
  }

  async rmClient(id) {
    const client = this._clients[id];

    clearInterval(client._intervalPing);
    clearTimeout(client._timeoutConnetcion);

    await client.disconnect();

    delete this._clients[id];
  }

  getClient(id) {
    return this._clients[id];
  }

  send(client, topic, data) {
    return new Promise((resolve, reject) => {
      const messageId = this._genMessageID();
      const buffer    = new Buffer(JSON.stringify({ messageId: messageId, topic: topic, data: data }));

      let tries       = this._messageTries;
      let timeout;

      client.once(messageId, (data) => {
        clearTimeout(timeout);
        resolve(data);
      });

      // console.log('send', messageId, topic);

      const send = () => {
        this.socket.send(buffer, 0, buffer.length, client.port, client.host, (err) => {
          if (err) {
            reject(err);
          } else {
            timeout = setTimeout(() => {
              if (--tries) {
                console.log('retrying', messageId);
                send();
              } else {
                console.log('timeout', messageId);
                client.removeAllListeners(messageId);
                reject();
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

  get clients() {
    let list = [];
    let client;

    for (let i in this._clients) {
      client = this._clients[i];

      list.push({
        id:       client.id,
        name:     client.name,
        type:     client.type,
        version:  client.version,
        state:    client.state,
        actions:  client.actions,
      });
    }

    return list;
  }

  get data() {
    return {
      modules: this.clients,
    }
  }
}

module.exports = Server;
