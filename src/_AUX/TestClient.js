const Client = require('./FakeClient');

var host = '192.168.15.10';
var port = 4000;

let c = new Client;

c.connect(port, host).then(() => {
  console.log('connected');
});

c.on('ping', () => {
  c.send('ping');
});
