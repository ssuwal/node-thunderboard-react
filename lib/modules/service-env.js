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
	this._noble_char_p = null;
	this._noble_char_al = null; // Ambient light
	this._noble_char_sl = null; // Sound Level
	this._noble_char_ecp = null; // Env Control Point
	noble_char_list.forEach((c) => {
		switch(c.uuid) {
			case '2a6f': // humidity
				this._noble_char_h = c;
				break;
			case '2a6e': // Temperature
				this._noble_char_t = c;
				break;
			case '2a76': // UV Index
				this._noble_char_u = c;
				break;
			case '2a6d':
				this._noble_char_p = c;
				break;
			case 'c8546913bfd945eb8dde9f8754f4a32e': // Ambient ligth react
				this._noble_char_al = c;
				break;
			case 'c8546913bf0245eb8dde9f8754f4a32e': // Sound Level
				this._noble_char_sl = c;
				break;
			case 'c8546913bf0345eb8dde9f8754f4a32e': // Env Control Point
				this._noble_char_ecp = c;
				break;
		}
		// if(c.uuid === '2a6f') { // humidity
		// 	this._noble_char_h = c;
		// } else if(c.uuid === '2a6e') { // Temperature
		// 	this._noble_char_t = c;
		// } else if(c.uuid === '2a76') { // UV Index
		// 	this._noble_char_u = c;
		// }
	});
	this.name = 'env';
	this.res_all = {};
};

ThunderboardReactServiceEnv.prototype._parseResponse = function(char_uuid, buf) {
	if(!buf) {
		return null;
	} 
	// else if(char_uuid === '2a6f') { // humidity
	// 	return {'humidity': buf.readUInt16LE(0) / 100};
	// } else if(char_uuid === '2a6e') { // Temperature
	// 	return {'temperature': buf.readInt16LE(0) / 100};
	// } else if(char_uuid === '2a76') { // UV Index
	// 	return {'uvIndex': buf.readUInt8(0)};
	// } else {
	// 	return null;
	// }

	switch(char_uuid) {
		case '2a6f': // humidity
			return {'humidity': buf.readUInt16LE(0) / 100};
		case '2a6e': // Temperature
			return {'temperature': buf.readInt16LE(0) / 100};
		case '2a76': // UV Index
			return {'uvIndex': buf.readUInt8(0)};
		case '2a6d': //pressure
			return {'pressure': buf.readUInt32LE(0) / 1000};
		case 'c8546913bfd945eb8dde9f8754f4a32e': // Ambient ligth react
			return {'light': buf.readUInt32LE(0) / 100};
		case 'c8546913bf0245eb8dde9f8754f4a32e': // Sound Level
			return {'sound': buf.readUInt16LE(0) / 100};
		// case 'c8546913bf0345eb8dde9f8754f4a32e': // Env Control Point
		// 	return {'env_control_piont': buf.read}
		default:
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
		this._noble_char_u,
		this._noble_char_p,
		this._noble_char_al,
		this._noble_char_sl
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