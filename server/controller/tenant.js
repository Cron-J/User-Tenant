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
        if (request.payload.status) query['status'] = new RegExp(request.payload.status, "i");
        
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

exports.updateTenantByAdminOrTenantAdmim = {
    auth: {
        strategy: 'token',
        scope: ['Admin', 'Tenant-Admin']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {
        
            /* filterening unwanted attributes which may have in request.payload and can enter bad data */
            if(request.payload.tenantId) request.payload.tenantId = undefined;
            if(request.payload.createdBy) request.payload.createdBy = undefined;

            if(decoded.scope === 'Admin'){
                request.payload.updatedBy = 'Admin';
            }
            else if(decoded.scope === 'Tenant-Admin'){
                request.payload.updatedBy = 'Tenant-Admin';
                request.params.id = decoded.tenantId;
            }

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
