/* ------------------------------------------------------------------
* node-thunderboard-react - device.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-08-25
* ---------------------------------------------------------------- */
'use strict';
var mEventEmitter = require('events').EventEmitter;
var mUtil         = require('util');

/* ------------------------------------------------------------------
* Constructor: ThunderboardReactDevice(peripheral)
* - peripheral:
*     A Peripheral object of the noble module
* ---------------------------------------------------------------- */
var ThunderboardReactDevice = function(peripheral) {
	this._noble = {
		'peripheral': peripheral,
		'services': {},
		'characteristics': {}
	};
	this._services = {};
	this._ThunderboardReactService = require('./service.js');

	this.id = peripheral.id;
	this.uuid = peripheral.uuid;
	this.address = peripheral.address;
	this.localName = peripheral.advertisement.localName;

	this.connection = false;
	this.wasClean = false;

	mEventEmitter.call(this);
};
mUtil.inherits(ThunderboardReactDevice, mEventEmitter);

/* ------------------------------------------------------------------
* Method: connect([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.connect = function(callback) {
	if(typeof(callback) !== 'function') {
		callback = function() {};
	}

	var p = this._noble['peripheral'];

	if(p['state'] === 'connected') {
		callback(null);
		return;
	}

	p.on('connect', () => {
		this.connection = true;
		this.emit('connect', null);
	});
	p.on('disconnect', () => {
		this.connection = false;
		this._terminateActivities();
		this.emit('disconnect', {'wasClean': this.wasClean});
		this.wasClean = false;
	});
	p.connect((error) => {
		if(error) {
			var err = new Error('Failed to connect to the device: ' + error.toString());
			callback(err);
		} else {
			this._getServices(callback);
		}
	});
};

ThunderboardReactDevice.prototype._terminateActivities = function() {
	for(var k in this._services) {
		var s = this._services[k];
		if(s.removeAllListeners) {
			this._services[k].removeAllListeners('data');
		}
	}
	var p = this._noble['peripheral'];
	p.removeAllListeners('connect');
	p.removeAllListeners('disconnect');
};

ThunderboardReactDevice.prototype._getServices = function(callback) {
	this._noble['peripheral'].discoverServices([], (error, service_list) => {
		if(error) {
			var err = new Error('Failed to discover services: ' + error.toString());
			callback(err);
		} else {
			if(service_list.length === 0) {
				setTimeout(() => {
					this._getServies(callback);
				}, 500);
				return;
			}
			var service_uuid_list = [];
			for(var i=0; i<service_list.length; i++) {
				var s = service_list[i];
				this._noble['services'][s.uuid] = s;
				service_uuid_list.push(s.uuid);
			}
			this._getCharacteristics(service_uuid_list, callback);
		}
	});
};

ThunderboardReactDevice.prototype._getCharacteristics = function(service_uuid_list, callback) {
	if(service_uuid_list.length === 0) {
		callback(null);
		return;
	} else {
		var service_uuid = service_uuid_list.shift();
		var noble_service = this._noble['services'][service_uuid];
		var service = new this._ThunderboardReactService(noble_service);
		service.init((error, obj) => {
			if(obj) {
				var service_name = obj['name'];
				this._services[service_name] = obj;
			}
			this._getCharacteristics(service_uuid_list, callback);
		});
	}
};

/* ------------------------------------------------------------------
* Method: disconnect([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.disconnect = function(callback) {
	if(typeof(callback) !== 'function') {
		callback = function() {};
	}

	var p = this._noble['peripheral'];

	if(p['state'] !== 'connected') {
		callback(null);
		return;
	}

	this.wasClean = true;

	p.disconnect((error) => {
		if(error) {
			var err = new Error('Failed to disconnect the device: ' + error.toString());
			callback(err);
		} else {
			this._terminateActivities();
			callback(null);
		}
	});

};


/* ##################################################################
* Device Information Service
* ###################################################################

/* ------------------------------------------------------------------
* Method: getManufacturerName(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getManufacturerName = function(callback) {
	var service = this._services['dev'];
	service.getManufacturerName(callback);
};

/* ------------------------------------------------------------------
* Method: getModelNumber(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getModelNumber = function(callback) {
	var service = this._services['dev'];
	service.getModelNumber(callback);
};

/* ------------------------------------------------------------------
* Method: getFirmwareRevision(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getFirmwareRevision = function(callback) {
	var service = this._services['dev'];
	service.getFirmwareRevision(callback);
};

/* ------------------------------------------------------------------
* Method: getSystemId(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getSystemId = function(callback) {
	var service = this._services['dev'];
	service.getSystemId(callback);
};

/* ------------------------------------------------------------------
* Method: getDeviceInfo(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getDeviceInfo = function(callback) {
	var service = this._services['dev'];
	service.getAll(callback);
};

/* ##################################################################
* Battery Service
* ###################################################################

/* ------------------------------------------------------------------
* Method: getBatteryLevel(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getBatteryLevel = function(callback) {
	var service = this._services['bat'];
	service.getBatteryLevel(callback);
};

/* ------------------------------------------------------------------
* Method: startMonitorBatteryLevel([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.startMonitorBatteryLevel = function(callback) {
	var service = this._services['bat'];
	service.startMonitorBatteryLevel(callback);
	service.on('data', (event) => {
		this.emit('battery', event);
	});
};

/* ------------------------------------------------------------------
* Method: stopMonitorBatteryLevel([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.stopMonitorBatteryLevel = function(callback) {
	var service = this._services['bat'];
	service.stopMonitorBatteryLevel(callback);
	service.removeAllListeners('data');
};

/* ##################################################################
* Environmental Sensing Service
* ###################################################################

/* ------------------------------------------------------------------
* Method: getHumidity(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getHumidity = function(callback) {
	var service = this._services['env'];
	service.getHumidity(callback);
};

/* ------------------------------------------------------------------
* Method: getTemperature(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getTemperature = function(callback) {
	var service = this._services['env'];
	service.getTemperature(callback);
};

/* ------------------------------------------------------------------
* Method: getUvIndex(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getUvIndex = function(callback) {
	var service = this._services['env'];
	service.getUvIndex(callback);
};

/* ------------------------------------------------------------------
* Method: getEnvironmentalSensing(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getEnvironmentalSensing = function(callback) {
	var service = this._services['env'];
	service.getAll(callback);
};

/* ##################################################################
* Ambient Light Service
* ###################################################################

/* ------------------------------------------------------------------
* Method: getAmbientLight(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getAmbientLight = function(callback) {
	var service = this._services['amb'];
	service.getAmbientLight(callback);
};

/* ##################################################################
* Cycling Speed and Cadence Service
* ###################################################################

/* ------------------------------------------------------------------
* Method: startMonitorCsc([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.startMonitorCsc = function(callback) {
	var service = this._services['cyc'];
	service.startMonitorCsc(callback);
	service.on('data', (event) => {
		this.emit('csc', event);
	});
};

/* ------------------------------------------------------------------
* Method: stopMonitorCsc([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.stopMonitorCsc = function(callback) {
	var service = this._services['cyc'];
	service.stopMonitorCsc(callback);
	service.removeAllListeners('data');
};

/* ##################################################################
* Acceleration and Orientation Service
* ###################################################################

/* ------------------------------------------------------------------
* Method: startMonitorAcceleration([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.startMonitorAcceleration = function(callback) {
	var service = this._services['acc'];
	service.startMonitorAcceleration(callback);
	service.on('data', (event) => {
		this.emit('acceleration', event);
	});
};

/* ------------------------------------------------------------------
* Method: stopMonitorAcceleration([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.stopMonitorAcceleration = function(callback) {
	var service = this._services['acc'];
	service.stopMonitorAcceleration(callback);
	service.removeAllListeners('data');
};

/* ------------------------------------------------------------------
* Method: startMonitorOrientation([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.startMonitorOrientation = function(callback) {
	var service = this._services['acc'];
	service.startMonitorOrientation(callback);
	service.on('data', (event) => {
		this.emit('orientation', event);
	});
};

/* ------------------------------------------------------------------
* Method: stopMonitorOrientation([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.stopMonitorOrientation = function(callback) {
	var service = this._services['acc'];
	service.stopMonitorOrientation(callback);
	service.removeAllListeners('data');
};

/* ##################################################################
* Automation IO Service
* ###################################################################

/* ------------------------------------------------------------------
* Method: getLedStatus(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getLedStatus = function(callback) {
	var service = this._services['aut'];
	service.getLedStatus(callback);
};

/* ------------------------------------------------------------------
* Method: setLedStatus(status, callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.setLedStatus = function(status, callback) {
	var service = this._services['aut'];
	service.setLedStatus(status, callback);
};

/* ------------------------------------------------------------------
* Method: getSwitchStatus(callback)
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.getSwitchStatus = function(callback) {
	var service = this._services['aut'];
	service.getSwitchStatus(callback);
};

/* ------------------------------------------------------------------
* Method: startMonitorSwitchStatus([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.startMonitorSwitchStatus = function(callback) {
	var service = this._services['aut'];
	service.startMonitorSwitchStatus(callback);
	service.on('data', (event) => {
		this.emit('switch', event);
	});
};

/* ------------------------------------------------------------------
* Method: stopMonitorSwitchStatus([callback])
* ---------------------------------------------------------------- */
ThunderboardReactDevice.prototype.stopMonitorSwitchStatus = function(callback) {
	var service = this._services['aut'];
	service.stopMonitorSwitchStatus(callback);
	service.removeAllListeners('data');
};

module.exports = ThunderboardReactDevice;