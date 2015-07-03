'use strict';

var Boom = require('boom'),
    Config = require('../config/config'),
    Jwt = require('jsonwebtoken'),
    EmailServices = require('../Utility/emailServices'),
    constants = require('../Utility/constants').constants,
    json2csv = require('json2csv'),
    Crypto = require('../Utility/cryptolib'),
    User = require('../model/user').User,
    Tenant = require('../model/tenant').Tenant,
    async = require("async");

exports.createTenantSelfRegistration = {
    handler: function(request, reply) {
        Tenant.saveTenant( request.payload.tenant, function( err, tenant ) {
             if (!err) {
                request.payload.user.tenantId = tenant._id;
                request.payload.user.password = Crypto.encrypt(request.payload.user.password);
                request.payload.user.scope = "Tenant-Admin";
                request.payload.user.createdBy = "Self";
                request.payload.user.updatedBy = "Self";
                request.payload.user.isActive = true;
                
                User.saveUser( request.payload.user, function(err, user) {
                    if (!err) {
                        var tokenData = {
                            userName: user.userName,
                            scope: [user.scope],
                            id: user._id
                        };
                        EmailServices.sendVerificationEmail(user, Jwt.sign(tokenData, Config.key.privateKey));
                        reply( "company successfully registered" );
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

exports.createTenantByAdmin = {
    handler: function(request, reply) {
        Tenant.saveTenant( request.payload, function( err, tenant ) {
            if (!err) {
                reply( "tenant has created" );
            } else {
                if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                    reply(Boom.forbidden( "tenant name already exist" ));
                } else reply( Boom.forbidden( err ) ); // HTTP 403
            }
        });
    }
};

exports.searchTenant = {
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

            request.payload.updatedBy = decoded.scope;

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

exports.exportTenant = {
    auth: {
        strategy: 'token',
        scope: ['Admin']
    },
    handler: function(request, reply) {
        var query = {};
            query['scope'] = {'$ne': 'Admin'};
        var dump = [];
        Tenant.searchTenant(query, function(err, tenants) {
            if (!err) {
                    var query1 = {};
                    async.each(tenants, function(tenant, callback){
                        query1['tenantId'] = tenant._id;
                            User.searchUser(query1, function(err, user) {
                                if (!err) {
                                    if(user.length == 0) {
                                        dump.push(customJson(tenant));
                                    } 
                                    else{
                                        for(var i = 0; i < user.length; i++) {
                                            if(user[i].isEmailVerified)
                                                dump.push(customJson(tenant, user[i]));
                                        }
                                        
                                    }
                                    callback();
                                } 
                                else reply(Boom.forbidden(err));

                            }); 
                        },
                        function(err){
                            if(!err) {
                                //sorting data by tenant name
                                dump.sort(function(a, b) {
                                    var textA = a.name.toUpperCase();
                                    var textB = b.name.toUpperCase();
                                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                                });
                                //writing data into csv file
                                json2csv({data: dump,  fields: ['name', 'description', 'username', 'firstName', 'lastName', 'email', 'role', 'isActive'], fieldNames: ['Tenant Name', 'Tenant Description', 'User name', 'First Name', 'Last Name', 'Email', 'User Role', 'Active'] }, function(err, csv1) {
                                  if (err) console.log(err);
                                    return reply(csv1).header('Content-Type', 'application/octet-stream').header('content-disposition', 'attachment; filename=user.csv;');
                                });

                            } else reply(Boom.forbidden(err));
                        }
                    );
                    
            } else reply(Boom.forbidden(err));
        });
    }
};
 var customJson = function (obj, list ) {
    var result = {};
    result['name'] = obj.name;
    if(obj.description)
        result['description'] = obj.description;
    else
        result['description'] = "-";
    if(list){
        result['username'] = list.username;
        result['firstName'] = list.firstName;
        result['lastName'] = list.lastName;
        result['email'] = list.email;
        result['role'] = list.scope;
        result['isActive'] = list.isActive;
    } else {
        result['username'] = "-";
        result['firstName'] = "-";
        result['lastName'] = "-";
        result['email'] = "-";
        result['role'] = "-";
        result['isActive'] = "-";
    }


    return result;
 }
