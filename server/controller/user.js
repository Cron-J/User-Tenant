'use strict';

var Boom = require('boom'),
    EmailServices = require('../Utility/emailServices'),
    Crypto = require('../Utility/cryptolib'),
    Config = require('../config/config'),
    constants = require('../Utility/constants').constants,
    Jwt = require('jsonwebtoken'),
    Tenant = require('../model/tenant').Tenant,
    User = require('../model/user').User;

var privateKey = Config.key.privateKey;

exports.createAdmin = {
    handler: function(request, reply) {
         User.findAdmin(function(err, result){
            if( result.length != 0 ){
                reply(Boom.forbidden("Admin already exist"));
            }
            else{
                if(request.payload.tenantId) {
                    request.payload.tenantId = undefined;
                }
                request.payload.password = Crypto.encrypt(request.payload.password);
                request.payload.scope = "Admin";
                request.payload.createdBy = "Self";
                request.payload.updatedBy = "Self";
                User.saveUser( request.payload, function(err, user) {
                    if (!err) {
                        var tokenData = {
                            userId: user.userId,
                            scope: [user.scope],
                            id: user._id
                        };
                        reply( "Admin successfully created" );
                    } else {
                        if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                            reply(Boom.forbidden("user email already registered"));
                        } else reply( Boom.forbidden(err) ); // HTTP 403
                    }
                });
            }
         });
    }
};

exports.createTenantUser = {
    handler: function(request, reply) {            
        if(!request.payload.tenantId) {
            reply(Boom.forbidden("Please select tenant"));
        }
        else{
            Tenant.findTenantById( request.payload.tenantId, function( err, tenant ) {
                if( tenant ){
                    request.payload.password = Crypto.encrypt(request.payload.password);
                    request.payload.scope = "Tenant-User";
                    request.payload.createdBy = "Self";
                    request.payload.updatedBy = "Self";
                    User.saveUser( request.payload, function(err, user) {
                        if (!err) {
                            var tokenData = {
                                userId: user.userId,
                                scope: [user.scope],
                                id: user._id
                            };
                            reply( "Tenant user successfully created" );
                        } else {
                            if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                                reply(Boom.forbidden("user email already registered"));
                            } else reply( Boom.forbidden(err) ); // HTTP 403
                        }
                    });
                }
                else {
                    reply(Boom.forbidden("Invalid tenant selected"));
                }
            });
        }
    }
};

exports.login = {
    handler: function(request, reply) {
        User.findUser(request.payload.userId, function(err, user) {
            if (!err) {
                if (user === null) return reply(Boom.forbidden("invalid username or password"));
                if (request.payload.password === Crypto.decrypt(user.password)) {

                    var  loginSummary = {};
                    if( user.firstLogin === undefined ) {
                        loginSummary['firstLogin'] = Date();
                    }
                    loginSummary['lastLogin'] = Date();

                        User.updateUser(user._id, loginSummary, function(err, result){
                            if(err) {
                                reply(Boom.forbidden("Oops something went wrong!"));
                            }
                            else{
                                var tokenData = {
                                    userId: user.userId,
                                    scope: [user.scope],
                                    tenantId : user.tenantId,
                                    id: user._id
                                },
                                res = {
                                    userId: user.userId,
                                    scope: user.scope,
                                    tenantId: user.tenantId,
                                    token: Jwt.sign(tokenData, privateKey)
                                };

                                reply(res);
                            }
                        });
                } else reply(Boom.forbidden("invalid username or password"));
            } else {
                if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                    reply(Boom.forbidden("please provide another user email"));
                } else {
                        console.error(err);
                        return reply(Boom.badImplementation(err));
                } 
            }
        });
    }
};

exports.forgotPassword = {
    handler: function(request, reply) {
        User.findUser(request.payload.userId, function(err, user) {
            if (!err) {
                if (user === null) return reply(Boom.forbidden("invalid userId"));
                var password = Crypto.encrypt(Math.random().toString(36).substring(7));
                User.updateUser( user._id, { "password" : password }, function(err, result){
                    if(err){
                        return reply(Boom.badImplementation("Error in sending password"));
                    }
                    else{
                        EmailServices.sentMailForgotPassword(user.userId, password);
                        reply("password is send to registered email id");
                    }
                });
            } else {       
                console.error(err);
                return reply(Boom.badImplementation(err));
             }
        });
    }
};

exports.getUser = {
    auth: {
        strategy: 'token',
        scope: ['Admin', 'Tenant-Admin', 'Tenant-User']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {        
            User.findUserById(decoded.id, function(err, user) {
                if(err){
                    return reply(Boom.badImplementation("unable to get user detail"));
                }
                else{
                    if(user){
                        user.password = undefined;
                        user.scope = undefined;
                        return reply(user);    
                    }
                    return reply(Boom.forbidden("unable to get user detail"));
                }
            });

       });
    }
};

exports.updateUser = {
    auth: {
        strategy: 'token',
        scope: ['Admin', 'Tenant-Admin', 'Tenant-User']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {
        
            /* filterening unwanted attributes which may have in request.payload and can enter bad data */
            if(request.payload.tenantId) request.payload.tenantId = undefined;
            if(request.payload.firstLogin) request.payload.firstLogin = undefined;
            if(request.payload.lastLogin) request.payload.lastLogin = undefined;
            if(request.payload.createdBy) request.payload.createdBy = undefined;
            if(request.payload.scope) request.payload.scope = undefined;
            if(request.payload.password) request.payload.password = Crypto.encrypt(request.payload.password);

            request.payload.updatedBy = 'Self';

            User.updateUser(decoded.id, request.payload, function(err, user) {
                if(err){
                    return reply(Boom.badImplementation("unable to update"));
                }
                else{
                    return reply("user updated successfully");
                }
            });

       });
    }
};

exports.updateUserByAdmin = {
    auth: {
        strategy: 'token',
        scope: ['Admin']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {
        
            /* filterening unwanted attributes which may have in request.payload and can enter bad data */
            if(request.payload.tenantId) request.payload.tenantId = undefined;
            if(request.payload.firstLogin) request.payload.firstLogin = undefined;
            if(request.payload.lastLogin) request.payload.lastLogin = undefined;
            if(request.payload.createdBy) request.payload.createdBy = undefined;
            if(request.payload.scope) request.payload.scope = undefined;
            if(request.payload.password) request.payload.password = Crypto.encrypt(request.payload.password);

            request.payload.updatedBy = 'Admin';

            User.updateUser(request.params.id, request.payload, function(err, user) {
                if(err){
                    return reply(Boom.badImplementation("unable to update"));
                }
                else{
                    if( user === 0 ) {
                        return reply(Boom.forbidden("unable to update"));
                    }
                    else{
                        return reply("user updated successfully");
                    }
                }
            });
       });
    }
};