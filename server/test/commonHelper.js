var async = require('async'),
	config = require('../config/config');

exports.removeCollections = function(Mongoose, cb){
	  Mongoose.connection.db.collectionNames(function(error, collections) {
	    if (error) {
	      throw new Error(error);
	    } else {
	      	async.parallel([
	            function(callback){
	            	if(collections.map(function(e) { return e.name; }).indexOf('users') != -1) {
	                        Mongoose.connection.db.dropCollection('users', function(err) {
	                        callback(err);
	                    });
	                }
	                else{
	                    callback();
	                }

	            },
	            function(callback){
	            	if(collections.map(function(e) { return e.name; }).indexOf('tenants') != -1) {
	                        Mongoose.connection.db.dropCollection('tenants', function(err) {	  
	                        callback(err);
	                    });
	                }
	                else{
	                    callback();
	                }

	            }

            ],
            // optional callback
	        function(err){
	        	cb(err);  
	        });  	

	    }
	  });
	//});
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