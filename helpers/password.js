/* Todo: Add different (non-core) hashing functions, b/scrypt etc. */

var crypto = require('crypto');

var random = require(__dirname + "/random");

module.exports = function password(value, options, done) {

	var hash = options.hash;
	var salt = options.salt || 20;

	if(!hash) {
		throw new Error("Missing hash type for password.");
	}

	random(null, { length: 8 }, function(randomStr) {

		try {

			hash = crypto.createHash(hash).update(randomStr).digest('hex');

			done(hash);

		} catch(e) {

			if(e.toString().match(/not supported/)) {
				throw new Error("Hash type " + hash + " not supported.");
			} else {
				throw e;
			}

		}

	});

}