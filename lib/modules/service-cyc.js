/* ------------------------------------------------------------------
* node-thunderboard-react - service-cyc.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-08-24
* ---------------------------------------------------------------- */
'use strict';
var mEventEmitter = require('events').EventEmitter;
var mUtil         = require('util');

/* ------------------------------------------------------------------
* Constructor: ThunderboardReactServiceCyc(noble_char_list)
* ---------------------------------------------------------------- */
var ThunderboardReactServiceCyc = function(noble_char_list) {
	this._noble_char_csc = null;
	noble_char_list.forEach((c) => {
		if(c.uuid === '2a5b') {
			this._noble_char_csc = c;
		}
	});
	this.name = 'cyc';

	mEventEmitter.call(this);
};
mUtil.inherits(ThunderboardReactServiceCyc, mEventEmitter);

/* ------------------------------------------------------------------
* Method: startMonitorCsc([callback])
* ---------------------------------------------------------------- */
ThunderboardReactServiceCyc.prototype.startMonitorCsc = function(callback) {
	this._noble_char_csc.on('data', (buf) => {
		var parsed = this._parseCsc(buf);
		this.emit('data', parsed);
	});
	this._noble_char_csc.subscribe((error) => {
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

ThunderboardReactServiceCyc.prototype._parseCsc = function(buf) {
	var res = {
		'present'    : buf.readUInt8(0) ? true : false,
		'revolutions': buf.readUInt32LE(1),
		'time'       : buf.readUInt16LE(5) / 1024 // sec
	};
	return res;
};

/* ------------------------------------------------------------------
* Method: stopMonitorCsc([callback])
* ---------------------------------------------------------------- */
ThunderboardReactServiceCyc.prototype.stopMonitorCsc = function(callback) {
	this._noble_char_csc.removeAllListeners('data');
	this._noble_char_csc.unsubscribe((error) => {
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

module.exports = ThunderboardReactServiceCyc;