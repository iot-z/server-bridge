const EventEmitter = require('events');
const dgram = require('dgram');

class Client extends EventEmitter {
    constructor() {
        super();

        this.moduleId = 'AAAAA-AAAAA-AAAAA-AAAAA';
        this.name     = 'NAME';
        this.type     = 'TYPE';
        this.version  = '1.0.0';

        this.socket = dgram.createSocket('udp4');

        this.socket.on('error', (err) => {
            console.log(`client error:\n${err.stack}`);
            this.socket.close();
        });

        this.socket.on('message', (msg, rinfo) => {
            const payload = JSON.parse(msg);

            console.log(payload);

            this.emit(payload.topic, payload.params);
            this.emit('message', payload.topic, payload.data);

            this.send(payload.messageId);
        });
    }

    send(topic, data = {}) {
        return new Promise((resolve, reject) => {
            const buffer = new Buffer(JSON.stringify({ moduleId: this.moduleId, topic: topic, data: data }));

            this.socket.send(buffer, 0, buffer.length, this.port, this.host, (err) => {
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

        return this.send('connect', { name: this.name, type: this.type, version: this.version });
    }

    get host() {
        return this._host;
    }

    get port() {
        return this._port;
    }
}

module.exports = Client;
