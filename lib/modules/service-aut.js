/* ------------------------------------------------------------------
* node-thunderboard-react - service-aut.js
*
* Copyright (c) 2016-2019, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2019-10-26
* ---------------------------------------------------------------- */
'use strict';
var mEventEmitter = require('events').EventEmitter;
var mUtil = require('util');

/* ------------------------------------------------------------------
* Constructor: ThunderboardReactServiceAut(noble_char_list)
* ---------------------------------------------------------------- */
var ThunderboardReactServiceAut = function (noble_char_list) {
	this._noble_char_sw = null;
	this._noble_char_led = null;
	noble_char_list.forEach((c) => {
		if (c.uuid === '2a56') {
			var p = c.properties;
			if (p.indexOf('notify') !== -1) {
				this._noble_char_sw = c;
			} else {
				this._noble_char_led = c;
			}
		}
	});
	this.name = 'aut';

	mEventEmitter.call(this);
};
mUtil.inherits(ThunderboardReactServiceAut, mEventEmitter);

/* ------------------------------------------------------------------
* Method: getLedStatus(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceAut.prototype.getLedStatus = function (callback) {
	this._noble_char_led.read((error, buf) => {
		if (error) {
			var err = new Error('Failed to get the characteristics: ' + error.toString());
			callback(err);
		} else {
			var parsed = this._parseLedStatus(buf);
			callback(null, parsed);
		}
	});
};

ThunderboardReactServiceAut.prototype._parseLedStatus = function (buf) {
	var v = buf.readUInt8(0);
	var led0 = v & 0b00000011;
	var led1 = (v & 0b00001100) >> 2;
	var parsed = {
		'led0': led0, // 0: Inactive, 1: Active, 2: Tristate, 3: Unknown
		'led1': led1
	}
	return parsed;
};

/* ------------------------------------------------------------------
* Method: setLedStatus(status, callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceAut.prototype.setLedStatus = function (status, callback) {
	if (!status || typeof (status) !== 'object' || !('led0' in status) || !('led1' in status)) {
		var err = new Error('The argument "led1" is invalid.');
		callback(err);
		return;
	}
	var buf = this._createLedStatus(status);
	this._noble_char_led.write(buf, false, (error) => {
		if (error) {
			var err = new Error('Failed to set the characteristics: ' + error.toString());
			callback(err);
		} else {
			callback(null);
		}
	});
};

ThunderboardReactServiceAut.prototype._createLedStatus = function (status, callback) {
	var led0 = (status['led0'] || 0) & 0b00000011;
	var led1 = ((status['led1'] || 0) & 0b00000011) << 2;
	var bin = led0 | led1;
	var buf = Buffer.from([bin]);
	return buf;
};

/* ------------------------------------------------------------------
* Method: getSwitchStatus(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceAut.prototype.getSwitchStatus = function (callback) {
	this._noble_char_sw.read((error, buf) => {
		if (error) {
			var err = new Error('Failed to get the characteristics: ' + error.toString());
			callback(err);
		} else {
			var parsed = this._parseSwitchStatus(buf);
			callback(null, parsed);
		}
	});
};

ThunderboardReactServiceAut.prototype._parseSwitchStatus = function (buf) {
	var v = buf.readUInt8(0);
	var sw0 = v & 0b00000011;
	var sw1 = (v & 0b00001100) >> 2;
	var parsed = {
		'sw0': sw0, // 0: Inactive, 1: Active, 2: Tristate, 3: Unknown
		'sw1': sw1
	}
	return parsed;
};

/* ------------------------------------------------------------------
* Method: startMonitorSwitchStatus([callback])
* ---------------------------------------------------------------- */
ThunderboardReactServiceAut.prototype.startMonitorSwitchStatus = function (callback) {
	this._noble_char_sw.on('data', (buf) => {
		var parsed = this._parseSwitchStatus(buf);
		this.emit('data', parsed);
	});

	this._noble_char_sw.subscribe((error) => {
		if (callback) {
			if (error) {
				var err = new Error('Failed to subscribe: ' + error.toString());
				callback(err);
			} else {
				callback(null);
			}
		}
	});
};


/* ------------------------------------------------------------------
* Method: stopMonitorSwitchStatus([callback])
* ---------------------------------------------------------------- */
ThunderboardReactServiceAut.prototype.stopMonitorSwitchStatus = function (callback) {
	this._noble_char_sw.removeAllListeners('data');
	this._noble_char_sw.unsubscribe((error) => {
		if (callback) {
			if (error) {
				var err = new Error('Failed to unsubscribe: ' + error.toString());
				callback(err);
			} else {
				callback(null);
			}
		}
	});
};

module.exports = ThunderboardReactServiceAut;