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
    Role = require('../model/role').Role,
    async = require("async");

exports.createTenantSelfRegistration = {
    handler: function(request, reply) {
        Tenant.saveTenant( request.payload.tenant, function( err, tenant ) {
             if (!err) {
                request.payload.user.tenantId = tenant._id;
                request.payload.user.password = Crypto.encrypt(request.payload.user.password);
                request.payload.user.scope = [1];
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

exports.createTenant = function(request, reply) {
    Tenant.saveTenant( request.payload, function( err, tenant ) {
        if (!err) {
            reply( "tenant has created" );
        } else {
            if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                reply(Boom.forbidden( "tenant name already exist" ));
            } else reply( Boom.forbidden( err ) ); // HTTP 403
        }
    });

};

exports.searchTenant =  function(request, reply) {
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
};

exports.getTenant = function(request, reply) {
    Tenant.findTenantByName( request.params.name, function( err, tenant ) {
        if (!err) {
            return reply(tenant);
        } else {
            reply( Boom.forbidden( err ) ); // HTTP 403
        }
    });
};

exports.updateTenant =  function(request, reply) {
       
    /* filterening unwanted attributes which may have in request.payload and can enter bad data */
    if(request.payload.createdBy) delete request.payload.createdBy;

    request.payload.updatedBy = request.pre.UT.scope[0].label;

    Tenant.updateTenant(request.params.id, request.payload, function(err, tenant) {
        if(err){
            return reply(Boom.badImplementation("unable to update"));
        }
        else{
            if( tenant === 0 ) {
                return reply(Boom.forbidden("unable to update"));
            }
            else{
                return reply("Tenant account updated successfully");
            }
        }
    });


};

exports.exportTenant = function(request, reply) {
        var query = {};
            query['scope'] = {'$ne': 'Admin'};
        var dump = [];
        Tenant.searchTenant(query, function(err, tenants) {
            if (!err) {
                var query1 = {};
                async.each(tenants, function(tenant, callback){
                    query1['tenantId'] = tenant._id;
                        User.searchUser(query1, function(err, users) {
                            if (!err) {
                                if(users.length == 0) {
                                    dump.push(customJson(tenant));
                                    callback();
                                } 
                                else{
                                    var list = JSON.parse(JSON.stringify(users));
                                    async.each(list, function(user, callback1){
                                        Role.findRoles(user.scope, function(err, role){
                                            if(!err){
                                                for (var i = 0; i < role.length; i++) {
                                                    user.scope[i] = role[i].label;
                                                };
                                                
                                                dump.push(customJson(tenant, user));
                                                callback1();                
                                            }
                                            else reply(Boom.forbidden(err));
                                        });
                                    },
                                    function(err){
                                        callback();
                                    });
                                    
                                }
                            } 
                            else reply(Boom.forbidden(err));
                        }); 
                    }, function(err){
                        if(!err) {
                            //sorting data by tenant name
                            dump.sort(function(a, b) {
                                var textA = a.name.toUpperCase();
                                var textB = b.name.toUpperCase();
                                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                            });
                            //writing data into csv file
                            json2csv({data: dump,  fields: ['name', 'description', 'username', 'email', 'firstName', 'lastName', 'role', 'isActive'], fieldNames: ['Tenant Name', 'Tenant Description', 'User name', 'Email', 'First Name', 'Last Name', 'User Role(s)', 'Active'] }, function(err, csv1) {
                              if (err) console.log(err);
                                return reply(csv1).header('Content-Type', 'application/octet-stream').header('content-disposition', 'attachment; filename=user.csv;');
                            });

                        } else reply(Boom.forbidden(err));
                });
            } else reply(Boom.forbidden(err));
        });

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
        result['role'] = list.scope.toString();
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
