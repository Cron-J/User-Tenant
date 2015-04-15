var Config = require('../config/config');

// exports.removeCollections = function(mongoose, callback){
//     mongoose.connection.db.collectionNames(function(err, collections){
//         console.log(collections);
//         if(collections.map(function(e) { return e.name; }).indexOf('users') != -1) {
//                 mongoose.connection.db.dropCollection('mappings', function(err) {
//                 callback(err);
//             });
//         }
//         else{
//             callback();
//         }
//     });
// };

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