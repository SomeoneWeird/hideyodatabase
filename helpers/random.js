/* Todo: Add character selection */

var randomstring = require('randomstring').generate;

module.exports = function random(value, options, done) {

	var length = options.length || 20;

    var str = randomstring(length);
    
	done(str);

}