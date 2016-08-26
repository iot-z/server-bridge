import {EventEmitter} from 'events';
import dgram from 'dgram';
import Q from 'q';

const MAX_MESSAGE_ID = 255;
let MESSAGE_ID = 0;

class ServerClient extends EventEmitter {
  constructor(server, host, port) {
    super();

    this._host = host;
    this._port = port;

    this._lastTalkTime = Date.now();

    this.server = server;
  }

  send(topic, data) {
    return this.server.send(this, topic, data);
  }

  ask(topic, data) {
    return this.server.ask(this, topic, data);
  }

  get host() {
    return this._host;
  }

  get port() {
    return this._port;
  }
}

export default class Server extends EventEmitter {
  constructor(port) {
    super();

    this._port    = port;
    this._clients = {};

    this._pingDelay   = 50;
    this._pingTimeOut = 250;

    this.socket = dgram.createSocket('udp4');

    this.socket.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      this.socket.close();
    });

    this.socket.on('message', (buffer, rinfo) => {
      let payload = JSON.parse(buffer.toString());
      let client = this.getClient(rinfo.address, rinfo.port);

      if (!!client) {
        client.lastTalkTime = Date.now();

        if (payload.topic == 'ping') {
          // Do nothing
        } else if (payload.topic == 'disconnect') {
          this.rmClient(client.instance.host, client.instance.port);
        } else {
          console.log(buffer.toString());
          client.instance.emit(payload.topic, payload.data);
          client.instance.emit('*', payload.topic, payload.data);
          // this.emit(payload.topic, payload.data);
        }
      } else {
        if (payload.topic == 'connect') {
          this.newClient(rinfo.address, rinfo.port);
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

        if (now - client.lastTalkTime > this._pingDelay) {
          if (now - client.lastTalkTime < this._pingTimeOut) {
            client.instance.send('ping');
          } else {
            this.rmClient(client.instance.host, client.instance.port);
          }
        }
      }
    }, 1000/30);
  }

  newClient(host, port) {
    let client = {
      instance: new ServerClient(this, host, port),
      lastTalkTime: Date.now()
    };

    this._clients[host+':'+port] = client;

    client.instance.send('connect');
    this.emit('connection', client.instance);
  }

  getClient(host, port) {
    return this._clients[host+':'+port];
  }

  rmClient(host, port) {
    let client = this._clients[host+':'+port];

    client.instance.send('disconected');
    client.instance.emit('disconected');

    delete this._clients[host+':'+port];
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
    messageID = this._genMessageID(),
    buffer = new Buffer(JSON.stringify({id: messageID, topic: topic, data: data}));

    client.once(messageID, (data) => {
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
}
