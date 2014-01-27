var mongo = require(__dirname + "/mongodb");

var drivers = {};

drivers.mongo = drivers.mongodb = drivers.MongoDB = mongo;

module.exports = drivers;