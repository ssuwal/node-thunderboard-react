/* ------------------------------------------------------------------
* node-thunderboard-react - node-thunderboard-react.js
*
* Copyright (c) 2016-2019, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2019-10-26
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: Thunderboard(params)
* - params:
*     noble  : The Nobel object created by the noble module.
*              This parameter is optional. If you don't specify
*              this parameter, this module create it.
* ---------------------------------------------------------------- */
var ThunderboardReact = function (params) {
	this.noble = null;
	if (params && 'noble' in params) {
		if (typeof (params['noble']) === 'object') {
			this.noble = params['noble'];
		} else {
			throw new Error('The value of the "noble" property is invalid.');
		}
	} else {
		try {
			this.noble = require('@abandonware/noble');
		} catch (e) {
			this.noble = require('noble');
		}
	}

	this.discover_status = false;
	this.discover_wait = 3000; // ms
	this.discover_timer_id = 0;
	this.devices = {};
	this.peripherals = {};
	this.ThunderboardReactDevice = require('./modules/device.js');
};

/* ------------------------------------------------------------------
* Method: init(callback)
* ---------------------------------------------------------------- */
ThunderboardReact.prototype.init = function (callback) {
	if (typeof (callback) !== 'function') {
		callback = function () { };
	}
	this.initialized = false;
	console.log(this.noble.state);
	if (this.noble.state === 'poweredOn') {
		callback(null);
	} else {
		this.noble.on('stateChange', (state) => {
			if (state === 'poweredOn') {
				callback(null);
			} else {
				var err = new Error('Failed to initialize the Noble object: ' + state);
				callback(err);
			}
		});
	}
};

/* ------------------------------------------------------------------
* Method: stopDiscovery()
* ---------------------------------------------------------------- */
ThunderboardReact.prototype.stopDiscovery = function (callback) {
	console.log(`StopDiscovery  ${this.discover_status}`)
	if(this.discover_status === true) {
		this.discover_status = false;
		if(this.discover_timer_id !== 0) {
			clearTimeout(this.discover_timer_id);
			this.discover_timer_id = 0;
		}
		this.noble.removeAllListeners('discover');
		this.noble.stopScanning();
		console.log(`Stopping Discovery`)
		if (callback) callback()
		else return true;
	} else {
		if (callback) callback(new Error('Discovery Status False'))
		else return false;
	}
};

/* ------------------------------------------------------------------
* Method: startDiscovery(callback)
* ---------------------------------------------------------------- */
ThunderboardReact.prototype.startDiscovery = function (callback) {
	if (this.discover_status === true) {
		this.stopDiscovery();
	}
	if (this.initialized === false) {
		this.init((err) => {
			if (err) {
				callback(err, null);
			} else {
				this._discoverDevices(callback);
			}
		});
	} else {
		this._discoverDevices(callback);
	}
	this.discover_status = true;
};

ThunderboardReact.prototype._discoverDevices = function (callback) {
	this.peripherals = {};
	this.noble.on('discover', (peripheral) => {
		var ad = peripheral.advertisement;
		if (!ad.localName) { return; }
		if (!ad.localName.match(/^Thunder Sense/)) {
			return;
		}
		var addr = peripheral.address;
		if (this.peripherals[addr]) {
			return;
		}
		this.peripherals[addr] = peripheral;
		var device = new this.ThunderboardReactDevice(peripheral);
		callback(device);
	});
	this._scanDevices(callback);
};

ThunderboardReact.prototype._scanDevices = function (callback) {
	this.noble.startScanning([], true);
	this.discover_timer_id = setTimeout(() => {
		this.noble.stopScanning();
		this._scanDevices(callback);
	}, this.discover_wait);
};

module.exports = ThunderboardReact;