/* ------------------------------------------------------------------
* node-thunderboard-react - service.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-08-24
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: ThunderboardReactService(service)
* - service:
*     A Service object of the noble module
* ---------------------------------------------------------------- */
var ThunderboardReactService = function(noble_service) {
	this._noble = {
		'service': noble_service
	};
	this._discovery_timer_id = 0;
	this._discovery_retry = 0;
	this._discovery_retry_max = 3;
	this._discovery_wait = 3000;
};

/* ------------------------------------------------------------------
* Method: init(callback)
* ---------------------------------------------------------------- */
ThunderboardReactService.prototype.init = function(callback) {
	if(typeof(callback) !== 'function') {
		callback = function() {};
	}
	this._getCharacteristics(callback);
};

ThunderboardReactService.prototype._getCharacteristics = function(callback) {
	var noble_service = this._noble['service'];
	var service_uuid = noble_service.uuid;
	noble_service.discoverCharacteristics([], (error, characteristics) => {
		if(this._discovery_timer_id) {
			clearTimeout(this._discovery_timer_id);
			this._discovery_timer_id = 0;
			this._discovery_retry = 0;
		}

		if(error) {
			var err = new Error('Failed to get the characteristics.');
			callback(err);
		} else {
			var service = this._createServiceObject(characteristics);
			if(service) {
				callback(null, service);
			} else {
				var err = new Error('Failed to create a service object.');
				callback(err);
			}
		}
	});

	this._discovery_timer_id = setTimeout(() => {
		this._discovery_retry ++;
		if(this._discovery_retry >= this._discovery_retry_max) {
			var err = new Error('Failed to get characteristics.');
			callback(err);
		} else {
			this._getCharacteristics(callback);
		}
	}, this._discovery_wait);
};

ThunderboardReactService.prototype._createServiceObject = function(noble_char_list) {
	var noble_service = this._noble['service'];
	var service_uuid = noble_service.uuid;
	var constructor = null;
	if(service_uuid === '180a') {
		constructor = require('./service-dev.js');
	} else if(service_uuid === '180f') {
		constructor = require('./service-bat.js');
	} else if(service_uuid === '181a') {
		constructor = require('./service-env.js');
	} else if(service_uuid === 'd24c4f4e17a74548852cabf51127368b') {
		constructor = require('./service-amb.js');
	} else if(service_uuid === '1816') {
		constructor = require('./service-cyc.js');
	} else if(service_uuid === 'a4e649f44be511e5885dfeff819cdc9f') {
		constructor = require('./service-acc.js');
	} else if(service_uuid === '1815') {
		constructor = require('./service-aut.js');
	}
	if(constructor) {
		var obj = new constructor(noble_char_list);
		return obj;
	} else {
		return null;
	}
};


module.exports = ThunderboardReactService;