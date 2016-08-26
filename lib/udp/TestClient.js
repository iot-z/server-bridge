'use strict';

var _Client = require('./Client');

var _Client2 = _interopRequireDefault(_Client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var host = '192.168.15.10';
var port = 4123;

var c = new _Client2.default();

c.connect(port, host).then(function () {
  console.log('connected');
});

c.on('ping', function () {
  c.send('ping');
});