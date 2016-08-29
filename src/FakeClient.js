import {EventEmitter} from 'events';
import dgram from 'dgram';
import Q from 'q';

export default class Client extends EventEmitter {
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

    send(topic, ...message) {
        let d = Q.defer(),
            buffer = new Buffer(topic+(message.length ? ':'+message.join('|') : ''));

        this.socket.send(buffer, 0, buffer.length, this.port, this.host, (err) => {
            if (err) d.reject(err);
            else d.resolve();
        });

        return d.promise;
    }

    close() {
        this.socket.close();
    }

    connect(port, host) {
        this._host = host;
        this._port = port;

        return this.send('hi');
    }

    get host() {
        return this._host;
    }

    get port() {
        return this._port;
    }
}
