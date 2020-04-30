var ThunderboardReact = require('./lib/node-thunderboard-react');
var thunder = new ThunderboardReact();

// Initialize the ThunderboardReact object
thunder.init((error) => {
  // Discover the Thunderboard React Board Kit
  thunder.startDiscovery((device) => {
    console.log('- Found ' + device.localName);
    // Stop the discovery process
    thunder.stopDiscovery();
    // Connect to the found device
    device.on('connect', _ => {
      console.log(`Device Connected`);
    })
    device.connect((err) => {
        if (err) {
            console.error(err)
        }
      console.log('- Connected ' + device.localName);
      // Get the sensored data
      getEnvironmentalSensing(device);
      setInterval(() => {
        getEnvironmentalSensing(device);
      }, 60000)
    });
  });
});

// Get the sensored data
function getEnvironmentalSensing(device) {
  device.getEnvironmentalSensing((error, res) => {
    // Show the data
    console.log(`- Date: ${new Date()}`)
    console.log('- Sensored data:');
    console.log('  - Humidity    : ' + res.humidity + ' %');
    console.log('  - Temperature : ' + res.temperature + ' °C');
    console.log('  - UV Index    : ' + res.uvIndex);
    console.log('  - Pressure    : ' + res.pressure + ' mbar');
    console.log('  - Light       : ' + res.light + ' lx');
    console.log('  - Sound       : ' + res.sound + ' dB');
    // Disconnect the device
    // device.disconnect(() => {
    //   console.log('- Disconnected ' + device.localName);
    //   process.exit();
    // });
  });
}