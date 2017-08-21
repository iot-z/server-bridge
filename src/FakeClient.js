const EventEmitter = require('events');
const dgram = require('dgram');

class Client extends EventEmitter {
    constructor() {
        super();

        this.socket = dgram.createSocket('udp4');

        this.socket.on('error', (err) => {
            console.log(`client error:\n${err.stack}`);
            this.socket.close();
        });

        this.socket.on('message', (msg, rinfo) => {
            // topic:message
            let data   = msg.toString().split(/([^:]+):(.*)/),
              topic    = data[1] ? data[1] : msg.toString(),
              params   = data[2] ? data[2].split('|') : [];

            this.emit(topic, ...params);
            this.emit('message', topic, ...params);
        });
    }

    send(topic, data) {
        return new Promise((resolve, reject) => {
            const buffer = new Buffer(JSON.stringify({topic: topic, data: data}));

            this.socket.send(buffer, 0, buffer.length, this.port, this.host, (err) => {console.log(err);
                if (err) reject(err);
                else resolve();
            });
        });
    }

    close() {
        this.socket.close();
    }

    connect(port, host) {
        this._host = host;
        this._port = port;

        return this.send('connect');
    }

    get host() {
        return this._host;
    }

    get port() {
        return this._port;
    }
}

module.exports = Client;
