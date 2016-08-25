/* ------------------------------------------------------------------
* node-thunderboard-react - service-env.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-08-24
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: ThunderboardReactServiceEnv(noble_char_list)
* ---------------------------------------------------------------- */
var ThunderboardReactServiceEnv = function(noble_char_list) {
	this._noble_char_h = null;
	this._noble_char_t = null;
	this._noble_char_u = null;
	noble_char_list.forEach((c) => {
		if(c.uuid === '2a6f') { // humidity
			this._noble_char_h = c;
		} else if(c.uuid === '2a6e') { // Temperature
			this._noble_char_t = c;
		} else if(c.uuid === '2a76') { // UV Index
			this._noble_char_u = c;
		}
	});
	this.name = 'env';
	this.res_all = {};
};

ThunderboardReactServiceEnv.prototype._parseResponse = function(char_uuid, buf) {
	if(!buf) {
		return null;
	} else if(char_uuid === '2a6f') { // humidity
		return {'humidity': buf.readUInt16LE(0) / 100};
	} else if(char_uuid === '2a6e') { // Temperature
		return {'temperature': buf.readInt16LE(0) / 100};
	} else if(char_uuid === '2a76') { // UV Index
		return {'uvIndex': buf.readUInt8(0)};
	} else {
		return null;
	}
};

ThunderboardReactServiceEnv.prototype._readCharacteristic = function(noble_char, callback) {
	noble_char.read((error, buf) => {
		var res = this._parseResponse(noble_char.uuid, buf);
		if(error || !res) {
			var err = new Error('Failed to get the characteristics: ' + (error ? error.toString() : ''));
			callback(err)
		} else {
			callback(null, res);
		}
	});
};

/* ------------------------------------------------------------------
* Method: getHumidity(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceEnv.prototype.getHumidity = function(callback) {
	this._readCharacteristic(this._noble_char_h, callback);
};

/* ------------------------------------------------------------------
* Method: getTemperature(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceEnv.prototype.getTemperature = function(callback) {
	this._readCharacteristic(this._noble_char_t, callback);
};

/* ------------------------------------------------------------------
* Method: getUvIndex(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceEnv.prototype.getUvIndex = function(callback) {
	this._readCharacteristic(this._noble_char_u, callback);
};

/* ------------------------------------------------------------------
* Method: getAll(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceEnv.prototype.getAll = function(callback) {
	var noble_char_list = [
		this._noble_char_h,
		this._noble_char_t,
		this._noble_char_u
	];
	this.res_all = {};
	this._readCharacteristics(noble_char_list, callback);
};

ThunderboardReactServiceEnv.prototype._readCharacteristics = function(noble_char_list, callback) {
	if(noble_char_list.length === 0) {
		callback(null, this.res_all);
		return;
	}
	var noble_char = noble_char_list.shift();
	this._readCharacteristic(noble_char, (error, res) => {
		if(error) {
			callback(error);
		} else {
			for(var k in res) {
				this.res_all[k] = res[k];
			}
			this._readCharacteristics(noble_char_list, callback);
		}
	});
};

module.exports = ThunderboardReactServiceEnv;