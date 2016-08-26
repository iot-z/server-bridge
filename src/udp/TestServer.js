import SocketIO from 'socket.io';
import Server from './Server';
import Module, {INPUT, OUTPUT, HIGH, LOW} from './Module';
import {D2} from '../utils/NodeMCU';
import $ from '../utils/Helpers';

var serverUser = new SocketIO();
let serverModule = new Server(4123);
let pin = D2;
let state = false;
let b;

serverModule.on('connection', (client) => {
  client.on('setDevice', (ID, TYPE, VERSION) => {
    console.log(ID, TYPE, VERSION);

    b = new Module(ID, TYPE, VERSION, client);

    b.pinMode(pin, OUTPUT);

    $.loop(1000, () => {
      console.time('t');

      b.digitalRead(pin).then((v) => {
        console.timeEnd('t');
        console.log(v.level);
      });
    });
  });
});

serverUser.on('connection', (client) => {
  client.on('toggle', () => {
    state = !state;
    b.digitalWrite(pin, state ? HIGH : LOW).then(() => {
      client.emit('response');
    });
  });
});
io.listen(3000);
