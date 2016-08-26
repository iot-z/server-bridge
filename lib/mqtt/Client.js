'use strict';

var _mqtt = require('mqtt');

var mqtt = _interopRequireWildcard(_mqtt);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', function () {
    client.publish('presence', 'Hello mqtt');
});

client.on('disconnect', function () {
    console.log('disconnected');
});

client.on('message', function (topic, message) {
    var data = message.toString().split('|');

    if (topic == 'digitalRead') {
        client.publish(data[0], 'PIN VALUE');
    }
});