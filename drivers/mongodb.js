var EventEmitter = require('events').EventEmitter;
var util		 = require('util');
var mongodb      = require('mongodb');
var async 		 = require('async');

var MongoDriver = function(options) {

	var self = this;
	
	this.host         = options.host || "127.0.0.1";
	this.port         = options.port || 27017;
	this.database     = options.database;
	this.database_out = options.output_database || this.database + "_hydb";

    this.conn     = new mongodb.Server(this.host, this.port);
    this.conn_out = new mongodb.Server(this.host, this.port);

    this.db = new mongodb.Db(this.database, this.conn, {
    	w: 1
    });

    this.odb = new mongodb.Db(this.database_out, this.conn_out, {
    	w: 1
    });

    this.db.open(function(err, client) {

    	if(err) {
    		return self.emit('error', err);
    	}

    	self.client = client;

    	self.odb.open(function(err, client_out) {

    		if(err) {
    			return self.emit('error', err);
    		}

    		self.client_out = client_out;

	    	self.emit('connected');

    	});

    });

}

util.inherits(MongoDriver, EventEmitter);

MongoDriver.prototype.getTables = function(callback) {

	var self = this;

	this.db.collectionNames(function(err, collections) {

		if(err) {
			return self.emit('error', err);
		}

		collections = collections.map(function(collection) {
			return collection.name.replace(self.database + '.', '');
		}).filter(function(collection) {
			if(collection == "system.indexes") return false;
			return true;
		});

		callback(collections);

	});

}

MongoDriver.prototype.processTable = function(collectionName, fn, callback) {

	var self = this;

	var collection = this.db.collection(collectionName);

	collection.find().toArray(function(err, rows) {

		if(err) {
			return self.emit('error', err);
		}

		async.each(rows, fn, callback);

	});

}

MongoDriver.prototype.saveTable = function(collectionName) {

	var self = this;

	var collection = this.odb.collection(collectionName);

	return function saveRow(row, done) {

		if(!row) {
			return done();
		}

		var oldId = row._id;
		delete row._id;

		console.log("Saving row", oldId);

		collection.update({
			_id: oldId,
		}, { $set: row }, {
			w: 1,
			upsert: true
		}, function(err) {

			if(err) {
				return self.emit('error', err);
			}

			console.log("Done row", oldId);

			done();

		});

	}

}

MongoDriver.prototype.close = function(done) {

	var self = this;

	this.db.close(function() {
		self.odb.close(function() {
			done && done();
		});
	});

}

module.exports = MongoDriver;