/* ------------------------------------------------------------------
* node-thunderboard-react - service-acc.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-08-24
* ---------------------------------------------------------------- */
'use strict';
var mEventEmitter = require('events').EventEmitter;
var mUtil         = require('util');

/* ------------------------------------------------------------------
* Constructor: ThunderboardReactServiceAcc(noble_char_list)
* ---------------------------------------------------------------- */
var ThunderboardReactServiceAcc = function(noble_char_list) {
	this._noble_char_acc = null;
	this._noble_char_ori = null;
	noble_char_list.forEach((c) => {
		if(c.uuid === 'c4c1f6e24be511e5885dfeff819cdc9f') {
			this._noble_char_acc = c;
		} else if(c.uuid === 'b7c4b694bee345ddba9ff3b5e994f49a') {
			this._noble_char_ori = c;
		}
	});
	this.name = 'acc';

	mEventEmitter.call(this);
};
mUtil.inherits(ThunderboardReactServiceAcc, mEventEmitter);

/* ------------------------------------------------------------------
* Method: startMonitorAcceleration([callback])
* ---------------------------------------------------------------- */
ThunderboardReactServiceAcc.prototype.startMonitorAcceleration = function(callback) {
	this._noble_char_acc.on('data', (buf) => {
		var parsed = this._parseAcceleration(buf);
		this.emit('data', parsed);
	});
	this._noble_char_acc.subscribe((error) => {
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

ThunderboardReactServiceAcc.prototype._parseAcceleration = function(buf) {
	var res = {
		'x': buf.readInt16LE(0) / 1000, // G
		'y': buf.readInt16LE(2) / 1000, // G
		'z': buf.readInt16LE(4) / 1000  // G
	};
	return res;
};

/* ------------------------------------------------------------------
* Method: stopMonitorAcceleration([callback])
* ---------------------------------------------------------------- */
ThunderboardReactServiceAcc.prototype.stopMonitorAcceleration = function(callback) {
	this._noble_char_acc.removeAllListeners('data-acceleration');
	this._noble_char_acc.unsubscribe((error) => {
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


/* ------------------------------------------------------------------
* Method: startMonitorOrientation([callback])
* ---------------------------------------------------------------- */
ThunderboardReactServiceAcc.prototype.startMonitorOrientation = function(callback) {
	this._noble_char_ori.on('data', (buf) => {
		var parsed = this._parseOrientation(buf);
		this.emit('data', parsed);
	});
	this._noble_char_ori.subscribe((error) => {
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

ThunderboardReactServiceAcc.prototype._parseOrientation = function(buf) {
	var res = {
		'alpha': buf.readInt16LE(0) / 100, // degree
		'beta' : buf.readInt16LE(2) / 100, // degree
		'gamma': buf.readInt16LE(4) / 100  // degree
	};
	return res;
};

/* ------------------------------------------------------------------
* Method: stopMonitorOrientation([callback])
* ---------------------------------------------------------------- */
ThunderboardReactServiceAcc.prototype.stopMonitorOrientation = function(callback) {
	this._noble_char_ori.removeAllListeners('data-orientation');
	this._noble_char_ori.unsubscribe((error) => {
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

module.exports = ThunderboardReactServiceAcc;