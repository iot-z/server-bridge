const Module = require('./module');

var host = '192.168.15.10';
var port = 4000;

let m = new Module('DDDDD-DDDDD-DDDDD-DDDDD', 'DDDDD');

m.connect(port, host).then(() => {
  console.log('connected');
});

m.on('ping', () => {
  m.send('ping');
});
