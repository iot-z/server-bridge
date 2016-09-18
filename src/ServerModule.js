import {EventEmitter} from 'events';
import dgram from 'dgram';
import Q from 'q';

const MAX_MESSAGE_ID = 65535; // uint16
let MESSAGE_ID = 0;

class Client extends EventEmitter {
  constructor(server, host, port, id, name, type, version) {
    super();

    this._host    = host;
    this._port    = port;
    this._id      = id;
    this._name    = name;
    this._type    = type;
    this._version = version;

    this._time = Date.now();

    this.server = server;
  }

  send(topic, data) {
    return this.server.send(this, topic, data);
  }

  ask(topic, data) {
    return this.server.ask(this, topic, data);
  }

  setTime() {
    this._time = Date.now();
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

  get type() {
    return this._type;
  }

  get version() {
    return this._version;
  }
}

export default class Server extends EventEmitter {
  constructor(port) {
    super();

    this._port    = port;
    this._clients = {};

    this._pingDelay   = 100;
    this._pingTimeOut = 500;

    this.socket = dgram.createSocket('udp4');

    this.socket.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      this.socket.close();
    });

    this.socket.on('message', (buffer, rinfo) => {
      let payload = JSON.parse(buffer.toString());
      let client = this.getClient(payload.moduleId);

      if (!!client) {
        client.setTime();

        if (payload.topic == 'ping') {
          // Do nothing
        } else if (payload.topic == 'disconnect') {
          this.rmClient(payload.moduleId);
        } else {
          client.emit(payload.topic, payload.data);
          client.emit('*', payload.topic, payload.data);
          // this.emit(payload.topic, payload.data);
        }
      } else {
        if (payload.topic == 'connect') {
          this.newClient(rinfo.address, rinfo.port, payload.moduleId, payload.name, payload.data.type, payload.data.version);
        }
      }
    });

    this.socket.on('listening', () => {
      let address = this.socket.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    this.socket.bind(this._port);

    setInterval(() => {
      let client, name;
      let now = Date.now();

      for (name in this._clients) {
        client = this._clients[name];

        if (now - client.time > this._pingDelay) {
          if (now - client.time < this._pingTimeOut) {
            client.send('ping');
          } else {
            console.log('timeout', client.id);
            this.rmClient(client.id);
          }
        }
      }
    }, 1000/30);
  }

  newClient(host, port, id, name, type, version) {
    let client = new Client(this, host, port, id, name, type, version);

    this._clients[id] = client;

    client.send('connect');
    this.emit('connection', client);
  }

  getClient(id) {
    return this._clients[id];
  }

  rmClient(id) {
    let client = this._clients[id];

    client.send('disconnect');
    client.emit('disconected');

    delete this._clients[id];
  }

  send(client, topic, data) {
    let d = Q.defer(),
    buffer = new Buffer(JSON.stringify({topic: topic, data: data}));

    this.socket.send(buffer, 0, buffer.length, client.port, client.host, (err) => {
      if (err) d.reject(err);
      d.resolve();
    });

    return d.promise;
  }

  ask(client, topic, data) {
    let d = Q.defer(),
    messageId = this._genMessageID(),
    buffer = new Buffer(JSON.stringify({messageId: messageId, topic: topic, data: data}));

    client.once(messageId, (data) => {
      d.resolve(data);
    });

    this.socket.send(buffer, 0, buffer.length, client.port, client.host, (err) => {
      if (err) d.reject(err);
    });

    return d.promise;
  }

  /**
  * Genherate a message ID
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

  get host() {
    return this._host;
  }

  get port() {
    return this._port;
  }

  get clients() {
    let c = [];

    for (let i in this._clients) {
      c.push({id: this._clients[i].id, type: this._clients[i].type, version: this._clients[i].version});
    }

    return c;
  }
}
