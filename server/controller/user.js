'use strict';

var Boom = require('boom'),
    EmailServices = require('../Utility/emailServices'),
    Crypto = require('../Utility/cryptolib'),
    Config = require('../config/config'),
    Jwt = require('jsonwebtoken'),
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
                User.saveUser( request.payload, function(err, user) {
                    if (!err) {
                        var tokenData = {
                            userId: user.userId,
                            scope: [user.scope],
                            id: user._id
                        };
                        reply( "user successfully created" );
                    } else {
                        if ( 11000 === err.code || 11001 === err.code ) {
                            reply(Boom.forbidden("user email already registered"));
                        } else reply( Boom.forbidden(err) ); // HTTP 403
                    }
                });
            }
         });
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
                if (11000 === err.code || 11001 === err.code) {
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
                EmailServices.sentMailForgotPassword(user);
                reply("password is send to registered email id");
            } else {       
                console.error(err);
                return reply(Boom.badImplementation(err));
             }
        });
    }
};