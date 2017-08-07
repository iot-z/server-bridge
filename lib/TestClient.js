'use strict';

var _FakeClient = require('./FakeClient');

var _FakeClient2 = _interopRequireDefault(_FakeClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var host = '192.168.15.10';
var port = 4123;

var c = new _FakeClient2.default();

c.connect(port, host).then(function () {
  console.log('connected');
});

c.on('ping', function () {
  c.send('ping');
});