var Mongoose = require('mongoose'),
	config = require('../config/config');

exports.removeCollections = function(callback){
	Mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);  
	var db = Mongoose.connection;
	db.on('open', function(){
	  Mongoose.connection.db.collectionNames(function(error, names) {
	    if (error) {
	      throw new Error(error);
	    } else {
	      names.map(function(cname) {
	      	console.log(cname.name);
	      	if( cname.name === 'users'){
	      		Mongoose.connection.db.dropCollection('users', function(err) {
	      			callback();	
			    });
	      	}      	
	      });
	    }
	  });
	});
};

exports.validAdminRegistraitionData = function(){
    var validAdminRegistraitionData = {
    	"userId": "gaurav@cronj.com",
	    "password": "cronj123",
	    "firstName": "gaurav",
	    "lastName": "gupta",
	    "address": {
	        "city": "Hyderabad",
	        "country": "India",
	        "addressCode": "713324"
	    }
    };

    return validAdminRegistraitionData;
}