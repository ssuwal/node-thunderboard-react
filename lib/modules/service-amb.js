/* ------------------------------------------------------------------
* node-thunderboard-react - service-amb.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-08-24
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: ThunderboardReactServiceAmb(noble_char_list)
* ---------------------------------------------------------------- */
var ThunderboardReactServiceAmb = function(noble_char_list) {
	this._noble_char_amb = null;
	noble_char_list.forEach((c) => {
		if(c.uuid === 'c8546913bfd945eb8dde9f8754f4a32e') {
			this._noble_char_amb = c;
		}
	});
	this.name = 'amb';
};

/* ------------------------------------------------------------------
* Method: getAmbientLight(callback)
* ---------------------------------------------------------------- */
ThunderboardReactServiceAmb.prototype.getAmbientLight = function(callback) {
	this._noble_char_amb.read((error, buf) => {
		if(error) {
			var err = new Error('Failed to get the characteristics: ' + error.toString());
			callback(err);
		} else {
			var res = {
				'lux': buf.readUInt32LE(buf) / 100
			};
			callback(null, res);
		}
	});
};

module.exports = ThunderboardReactServiceAmb;