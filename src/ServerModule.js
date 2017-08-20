const EventEmitter   = require('events');
const dgram          = require('dgram');

const MAX_MESSAGE_ID = 65535; // uint16
let MESSAGE_ID       = 0;

class Client extends EventEmitter {
  constructor(server, host, port, id, name, type, version) {
    super();

    this._host    = host;
    this._port    = port;
    this._id      = id;
    this._name    = name;
    this._type    = type;
    this._version = version;

    this.server   = server;

    this.driver   = new Driver(this);
    this.driver.state = MakeObservable(this.driver.state, this.driver.handleChange.bind(this.driver), true);

    this.setTime();
  }

  send(topic, data) {
    return this.server.send(this, topic, data);
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

    this._port    = port;
    this._clients = {};

    this._pingDelay         = 5000;
    this._messageTimeOut    = 5000;
    this._connectionTimeOut = 16000;

    this.socket = dgram.createSocket('udp4');

    this.socket.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      this.socket.close();
    });

    this.socket.on('message', (buffer, rinfo) => {
      const payload = JSON.parse(buffer.toString());
      const client = this.getClient(payload.moduleId);

      // console.log('received', payload.topic);

      if (!!client) {
        if (payload.topic == 'connect' || payload.topic == 'disconnect') {
          this.rmClient(payload.moduleId);
        } else {
          client.setTime(); // Update the time of last packet received
          client.emit(payload.topic, payload.data);
          client.emit('*', payload.topic, payload.data);
          this.emit(`${payload.moduleId}.${payload.topic}`, payload.data);
        }
      } else {
        if (payload.topic == 'connect') {
          this.newClient(rinfo.address, rinfo.port, payload.moduleId, payload.data.name, payload.data.type, payload.data.version);
        }
      }
    });

    this.socket.on('listening', () => {
      const address = this.socket.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    this.socket.bind(this._port);
  }

  newClient(host, port, id, name, type, version) {
    const client = new Client(this, host, port, id, name, type, version);

    this._clients[id] = client;

    client.send('connect', { timeout: this._connectionTimeOut });
    this.emit('connection', client);
  }

  rmClient(id) {
    const client = this._clients[id];

    clearInterval(client._intervalPing);
    clearTimeout(client._timeoutConnetcion);

    client.send('disconnect');
    client.emit('disconnect');

    delete this._clients[id];
  }

  getClient(id) {
    return this._clients[id];
  }

  async send(client, topic, data) {
    return await new Promise((resolve, reject) => {
      const messageId = this._genMessageID();
      const buffer    = new Buffer(JSON.stringify({ messageId: messageId, topic: topic, data: data }));
      let timeout;

      client.once(messageId, (data) => {
        clearTimeout(timeout);
        resolve(data);
      });

      // console.log('send', topic, data);

      this.socket.send(buffer, 0, buffer.length, client.port, client.host, (err) => {
        if (err) {
          reject(err);
        } else {
          timeout = setTimeout(() => {
            client.removeAllListeners(messageId);
            reject(err);
          }, this._messageTimeOut);
        }
      });
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
      });
    }

    return list;
  }

  get data() {
    return {
      clients: this.clients,
    }
  }
}

module.exports = Server;
