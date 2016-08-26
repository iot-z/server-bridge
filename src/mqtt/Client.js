import * as mqtt from 'mqtt';

let client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
    client.publish('presence', 'Hello mqtt');
});

client.on('disconnect', () => {
    console.log('disconnected');
});

client.on('message', (topic, message) => {
    var data = message.toString().split('|');

    if (topic == 'digitalRead') {
        client.publish(data[0], 'PIN VALUE');
    }
});
