import Client from './Client';

var host = '192.168.15.10';
var port = 4123;

let c = new Client;

c.connect(port, host).then(() => {
  console.log('connected');
});

c.on('ping', () => {
  c.send('ping');
});
