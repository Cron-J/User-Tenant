'use strict';

var Boom = require('boom'),
    Config = require('../config/config'),
    Jwt = require('jsonwebtoken'),
    EmailServices = require('../Utility/emailServices'),
    constants = require('../Utility/constants').constants,
    Crypto = require('../Utility/cryptolib'),
    User = require('../model/user').User,
    Tenant = require('../model/tenant').Tenant;

exports.createTenant = {
    handler: function(request, reply) {
        Tenant.saveTenant( request.payload.tenant, function( err, tenant ) {
            if (!err) {
                request.payload.user.tenantId = tenant._id;
                request.payload.user.password = Crypto.encrypt(request.payload.user.password);
                request.payload.user.scope = "Tenant-Admin";
                User.saveUser( request.payload.user, function(err, user) {
                    if (!err) {
                        var tokenData = {
                            userId: user.userId,
                            scope: [user.scope],
                            id: user._id
                        };
                        reply( "user successfully created" );
                    } else {
                        var errMessage = "Opps something went wrong.."
		                if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
		                	errMessage = "user id already exist";
		                } 
		                Tenant.remove( tenant._id, function(err, user) {
		                	 reply(Boom.forbidden( errMessage ));
		                }); 
		            }
                });
            } else {
                if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                    reply(Boom.forbidden( "tennant Id already exist" ));
                } else reply( Boom.forbidden( err ) ); // HTTP 403
            }
        });
    }
};

