'use strict';

var Boom = require('boom'),
    Config = require('../config/config'),
    Jwt = require('jsonwebtoken'),
    EmailServices = require('../Utility/emailServices'),
    constants = require('../Utility/constants').constants,
    Crypto = require('../Utility/cryptolib'),
    User = require('../model/user').User,
    Tenant = require('../model/tenant').Tenant;

exports.createTenantSelfRegistration = {
    handler: function(request, reply) {
        Tenant.saveTenant( request.payload.tenant, function( err, tenant ) {
             if (!err) {
                request.payload.user.tenantId = tenant._id;
                request.payload.user.password = Crypto.encrypt(request.payload.user.password);
                request.payload.user.scope = "Tenant-Admin";
                request.payload.user.isActive = true;
                
                User.saveUser( request.payload.user, function(err, user) {
                    if (!err) {
                        EmailServices.sentMailUserCreation(user.userId, user.password);
                        return reply( "user successfully created" );
                    } else {
                        var errMessage = "Opps something went wrong.."
                        if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                            errMessage = "user name already exist";
                        } 
                        Tenant.remove( tenant._id, function(err, user) {
                             reply(Boom.forbidden( errMessage ));
                        }); 
                    }
                });
            } else {
                if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                    reply(Boom.forbidden( "tenant name already exist" ));
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
        if (request.payload.name) query['name'] = new RegExp(request.payload.name, "i");
        if (request.payload.description) query['description'] = new RegExp(request.payload.description, "i");
        
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
