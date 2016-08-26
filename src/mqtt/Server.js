import * as mqtt from 'mqtt';
import {EventEmitter} from 'events';
import Board, {INPUT, OUTPUT, HIGH, LOW} from './Board';
import {D2} from '../utils/NodeMCU';
import $ from '../utils/Helpers';

let clients = {};

let server = http.createServer();


class ServerClient extends EventEmitter {
  constructor(server, port, host) {
    super();

    this._host = host;
    this._port = port;

    this.server = server;
  }

  send(topic, ...message) {
    return this.server.send(this, topic, ...message);
  }

  get host() {
    return this._host;
  }

  get port() {
    return this._port;
  }
}

new mqtt.Server(function(client) {
    var self = this;

    if (!self.clients) self.clients = {};

    client.on('connect', (packet) => {
        self.clients[packet.clientId] = client;
        client.id = packet.clientId;
        console.log("CONNECT: client id: " + client.id);
        client.subscriptions = [];
        client.connack({returnCode: 0});

        clients[client.id] = client;

        let pin   = D2;
        let b = new Board(client);
        let state = false;

        b.pinMode(pin, OUTPUT);

        b.digitalWrite(pin, (state = !state) ? HIGH : LOW);

        $.repeat(3, 1000, () => {
          b.digitalWrite(pin, (state = !state) ? HIGH : LOW);
        });

        $.loop(1000, () => {
          console.time('test');
          b.digitalRead(pin).then((v) => {
            console.log(v);
            console.timeEnd('test');
          });
        });
    });

    client.on('subscribe', function(packet) {
      var granted = [];

      console.log("SUBSCRIBE(%s): %j", client.id, packet);

      for (var i = 0; i < packet.subscriptions.length; i++) {
        var qos = packet.subscriptions[i].qos
          , topic = packet.subscriptions[i].topic
          , reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$');

        granted.push(qos);
        client.subscriptions.push(reg);
      }

      client.suback({messageId: packet.messageId, granted: granted});
    });

    client.on('publish', function(packet) {
      console.log("PUBLISH(%s): %j", client.id, packet);
      for (var k in self.clients) {
        var c = self.clients[k];

        for (var i = 0; i < c.subscriptions.length; i++) {
          var s = c.subscriptions[i];

          if (s.test(packet.topic)) {
            c.publish({topic: packet.topic, payload: packet.payload});
            break;
          }
        }
      }
    });

    client.on('subscribe', (packet) => {
        // console.log("SUBSCRIBE(%s): %j", client.id, packet);

        let granted = [];
        for (let i = 0, l = packet.subscriptions.length; i < l; i++) {
            granted.push(packet.subscriptions[i].qos);
        }

        client.suback({granted: granted, messageId: packet.messageId});
    });

    client.on('pingreq', function(packet) {
      console.log('PINGREQ(%s)', client.id);
      client.pingresp();
    });

    client.on('disconnect', function(packet) {
      client.stream.end();
    });

    client.on('close', function(packet) {
      delete self.clients[client.id];
    });

    client.on('error', function(e) {
      client.stream.end();
      console.log(e);
    });
}).listen(1883);
