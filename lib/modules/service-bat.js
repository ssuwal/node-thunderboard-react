/* ------------------------------------------------------------------
* node-thunderboard-react - service-bat.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-08-24
* ---------------------------------------------------------------- */
'use strict';
var mEventEmitter = require('events').EventEmitter;
var mUtil         = require('util');

/* ------------------------------------------------------------------
* Constructor: ThunderboardReactServiceBat(noble_char_list)
* ---------------------------------------------------------------- */
var ThunderboardReactServiceBat = function(noble_char_list) {
	this._noble_char_bat = null;
	noble_char_list.forEach((c) => {
		if(c.uuid === '2a19') {
			this._noble_char_bat = c;
		}
	});
	this.name = 'bat';

	mEventEmitter.call(this);
};
mUtil.inherits(ThunderboardReactServiceBat, mEventEmitter);

/* ------------------------------------------------------------------
* Method: getBatteryLevel(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceBat.prototype.getBatteryLevel = function(callback) {
	this._noble_char_bat.read((error, buf) => {
		if(error) {
			var err = new Error('Failed to get the characteristics: ' + error.toString());
			callback(err);
		} else {

			var res = this._parseBatteryLevel(buf);
			callback(null, res);
		}
	});
};

ThunderboardReactServiceBat.prototype._parseBatteryLevel = function(buf) {
	var res = {
		'level': buf.readUInt8(0)
	};
	return res;
};

/* ------------------------------------------------------------------
* Method: startMonitorBatteryLevel([callback])
* ---------------------------------------------------------------- */
ThunderboardReactServiceBat.prototype.startMonitorBatteryLevel = function(callback) {
	this._noble_char_bat.on('data', (buf) => {
		var parsed = this._parseBatteryLevel(buf);
		this.emit('data', parsed);
	});
	this._noble_char_bat.subscribe((error) => {
		if(callback) {
			if(error) {
				var err = new Error('Failed to subscribe: ' + error.toString());
				callback(err);
			} else {
				callback(null);
			}
		}
	});
};

/* ------------------------------------------------------------------
* Method: stopMonitorBatteryLevel([callback])
* ---------------------------------------------------------------- */
ThunderboardReactServiceBat.prototype.stopMonitorBatteryLevel = function(callback) {
	this._noble_char_bat.removeAllListeners('data');
	this._noble_char_bat.unsubscribe((error) => {
		if(callback) {
			if(error) {
				var err = new Error('Failed to unsubscribe: ' + error.toString());
				callback(err);
			} else {
				callback(null);
			}
		}
	});
};

module.exports = ThunderboardReactServiceBat;