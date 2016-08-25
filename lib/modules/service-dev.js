/* ------------------------------------------------------------------
* node-thunderboard-react - service-dev.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-08-24
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: ThunderboardReactServiceDev(noble_char_list)
* ---------------------------------------------------------------- */
var ThunderboardReactServiceDev = function(noble_char_list) {
	this._noble_char_manu = null;
	this._noble_char_model = null;
	this._noble_char_firm = null;
	this._noble_char_system = null;
	noble_char_list.forEach((c) => {
		if(c.uuid === '2a29') { // Manufacturer Name
			this._noble_char_manu = c;
		} else if(c.uuid === '2a24') { // Model Number
			this._noble_char_model = c;
		} else if(c.uuid === '2a26') { // Firmware Revision
			this._noble_char_firm = c;
		} else if(c.uuid === '2a23') { // System ID
			this._noble_char_system = c;
		}
	});
	this.name = 'dev';
	this.res_all = {};
};

ThunderboardReactServiceDev.prototype._parseResponse = function(char_uuid, buf) {
	if(!buf) {
		return null;
	} else if(char_uuid === '2a29') { // Manufacturer Name
		return {'manufacturerName': buf.toString()};
	} else if(char_uuid === '2a24') { // Model Number
		return {'modelNumber': buf.toString()};
	} else if(char_uuid === '2a26') { // Firmware Revision
		return {'firmwareRevision': buf.toString()};
	} else if(char_uuid === '2a23') { // System ID
		var mid = buf.slice(0, 5).toString('hex');
		var uid = buf.slice(5, 8).toString('hex');
		var res = {
			'manufacturerId': mid,
			'organizationallyUniqueId': uid,
			'systemId': mid + uid
		};
		return res;
	} else {
		return null;
	}
};

ThunderboardReactServiceDev.prototype._readCharacteristic = function(noble_char, callback) {
	if(!noble_char) {
		var err = new Error('The characteristic object of Noble is not found.');
		callback(err);
		return;
	}
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
* Method: getManufacturerName(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceDev.prototype.getManufacturerName = function(callback) {
	this._readCharacteristic(this._noble_char_manu, callback);
};

/* ------------------------------------------------------------------
* Method: getModelNumber(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceDev.prototype.getModelNumber = function(callback) {
	this._readCharacteristic(this._noble_char_model, callback);
};

/* ------------------------------------------------------------------
* Method: getFirmwareRevision(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceDev.prototype.getFirmwareRevision = function(callback) {
	this._readCharacteristic(this._noble_char_firm, callback);
};

/* ------------------------------------------------------------------
* Method: getSystemId(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceDev.prototype.getSystemId = function(callback) {
	this._readCharacteristic(this._noble_char_system, callback);
};

/* ------------------------------------------------------------------
* Method: getAll(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceDev.prototype.getAll = function(callback) {
	var noble_char_list = [
		this._noble_char_manu,
		this._noble_char_model,
		this._noble_char_firm,
		this._noble_char_system
	];
	this.res_all = {};
	this._readCharacteristics(noble_char_list, callback);
};

ThunderboardReactServiceDev.prototype._readCharacteristics = function(noble_char_list, callback) {
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

module.exports = ThunderboardReactServiceDev;