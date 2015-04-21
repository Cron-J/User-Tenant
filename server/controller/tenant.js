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
    auth: {
        strategy: 'token',
        scope: ['Admin']
    },
    handler: function(request, reply) {
        request.payload.tenant.createdBy = "Admin";
        request.payload.tenant.updatedBy = "Admin";
        Tenant.saveTenant( request.payload.tenant, function( err, tenant ) {
            if (!err) {
                request.payload.user.tenantId = tenant._id;
                request.payload.user.password = Crypto.encrypt(request.payload.user.password);
                request.payload.user.scope = "Tenant-Admin";
                request.payload.user.createdBy = "Admin";
                request.payload.user.updatedBy = "Admin";
                User.saveUser( request.payload.user, function(err, user) {
                    if (!err) {
                        EmailServices.sentMailUserCreation(user.userId, user.password);
                        return reply( "user successfully created" );
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

exports.createTenantSelfRegistration = {
    handler: function(request, reply) {
        request.payload.tenant.createdBy = 'Self Registraition';
        request.payload.tenant.updatedBy = 'Self Registraition';
        Tenant.saveTenant( request.payload.tenant, function( err, tenant ) {
            if (!err) {
                request.payload.user.tenantId = tenant._id;
                request.payload.user.password = Crypto.encrypt(request.payload.user.password);
                request.payload.user.scope = "Tenant-Admin";
                request.payload.user.createdBy = 'Self';
                request.payload.user.updatedBy = 'Self';
                User.saveUser( request.payload.user, function(err, user) {
                    if (!err) {
                        EmailServices.sentMailUserCreation(user.userId, user.password);
                        return reply( "user successfully created" );
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

exports.searchTenant = {
    auth: {
        strategy: 'token',
        scope: ['Admin']
    },
    handler: function(request, reply) {
        var query = {};
        if (request.payload.tenantId) query['tenantId'] = new RegExp(request.payload.tenantId, "i");
        if (request.payload.name) query['name'] = new RegExp(request.payload.name, "i");
        if (request.payload.description) query['description'] = new RegExp(request.payload.description, "i");
        if (request.payload.status) query['status'] = request.payload.status;
        
        Tenant.searchTenant(query, function( err, tenant ) {
            if (!err) {
                return reply(tenant);
            } else {
                reply( Boom.forbidden( err ) ); // HTTP 403
            }
        });
    }
};

exports.getTenant = {
    auth: {
        strategy: 'token',
        scope: ['Admin', 'Tenant-Admin']
    },
    handler: function(request, reply) {
        Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {

            if(decoded.scope === 'Tenant-Admin'){
                request.params.id = decoded.tenantId;
            }

            Tenant.findTenantById( request.params.id, function( err, tenant ) {
                if (!err) {
                    return reply(tenant);
                } else {
                    reply( Boom.forbidden( err ) ); // HTTP 403
                }
            });
        });
    }
};

exports.updateTenantByAdmin = {
    auth: {
        strategy: 'token',
        scope: ['Admin']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {
        
            /* filterening unwanted attributes which may have in request.payload and can enter bad data */
            if(request.payload.tenantId) delete request.payload.tenantId;
            if(request.payload.createdBy) delete request.payload.createdBy;

            request.payload.updatedBy = 'Admin';

            Tenant.updateTenant(request.params.id, request.payload, function(err, user) {
                if(err){
                    return reply(Boom.badImplementation("unable to update"));
                }
                else{
                    if( user === 0 ) {
                        return reply(Boom.forbidden("unable to update"));
                    }
                    else{
                        return reply("tenant updated successfully");
                    }
                }
            });
       });
    }
};
