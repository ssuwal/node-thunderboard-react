const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883')
let count = 0;
client.on('connect', _ => {
    console.log(`Connected to MQTT Mosquitto`)
    const publish = setInterval(() => {
        ++count;
        client.publish('testchannel/test', JSON.stringify({name: 'santosh', lastname: 'suwal', count}))
        // if (count >= 10) {
        //     clearInterval(publish);
        //     process.exit(0);
        // }
    }, 5000);
})