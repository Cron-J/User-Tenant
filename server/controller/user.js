'use strict';

var Boom = require('boom'),
    EmailServices = require('../Utility/emailServices'),
    Crypto = require('../Utility/cryptolib'),
    Config = require('../config/config'),
    json2csv = require('json2csv'),
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
                    delete request.payload.tenantId;
                }

                request.payload.password = Crypto.encrypt(request.payload.password);
                request.payload.scope = "Admin";

                if(request.payload.createdBy) {
                    delete request.payload.createdBy;
                }

                if(request.payload.updatedBy){
                    delete request.payload.updatedBy;
                }

                User.saveUser( request.payload, function(err, user) {
                    if (!err) {
                        reply( "Admin successfully created" );
                    } else {
                        if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                            reply(Boom.forbidden("user name already registered"));
                        } else reply( Boom.forbidden(err) ); // HTTP 403
                    }
                });
            }
         });
    }
};

exports.createUser = {
    handler: function(request, reply) {
            if( !request.payload.tenantId ){
                return reply(Boom.forbidden("Please select tenant"));
            }
            else {
                request.payload.password = Crypto.encrypt(Math.random().toString(8).substring(2));
                Tenant.findTenantById( request.payload.tenantId, function( err, tenant ) {
                    if( tenant ){
                        request.payload.password = Crypto.encrypt(request.payload.password);
                        request.payload.scope = "User";
                        User.saveUser( request.payload, function(err, user) {
                            if (!err) {
                                EmailServices.sentMailUserCreation(user.userId, user.password);
                                return reply( "Tenant user successfully created" );
                            } else {
                                if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                                    return reply(Boom.forbidden("user email already registered"));
                                } else return reply( Boom.forbidden(err) ); // HTTP 403
                            }
                        });
                    }
                    else {
                        return reply(Boom.forbidden("Invalid tenant selected"));
                    }
                });
            }
    }
};

exports.activateUserByTenant = {
    auth: {
        strategy: 'token',
        scope: ['Tenant-Admin']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {     
            User.activateUser(request.payload.id, decoded.tenantId, function(err, user) {
                if(err){
                    return reply(Boom.badImplementation("unable to activate user"));
                }
                else{
                    if(user){
                        user.password = undefined;
                        user.scope = undefined;
                        return reply(user);    
                    }
                    return reply(Boom.forbidden("no user exist"));
                }
            });

       });
    }
};

exports.searchUser = {
    auth: {
        strategy: 'token',
        scope: ['Admin']
    },
    handler: function(request, reply) {
        var query = {};
        if (request.payload.firstName) query['firstName'] = new RegExp(request.payload.firstName, "i");
        if (request.payload.lastName) query['lastName'] = new RegExp(request.payload.lastName, "i");
        if (request.payload.email) query['email'] = new RegExp(request.payload.email, "i");
        if (request.payload.scope) {
            query['scope'] = request.payload.scope;   
        }
        else query['scope'] = {'$ne': 'Admin'};

        User.searchUser(query, function(err, user) {
            if (!err) {
                for (var i = 0; i< user.length; i++) {
                   if( user[i].password ) { user[i].password = undefined; }
                }
                return reply(user);
            } else reply(Boom.forbidden(err));
        });
    }
};

exports.exportUser = {
    auth: {
        strategy: 'token',
        scope: ['Admin']
    },
    handler: function(request, reply) {
        var query = {};
            query['scope'] = {'$ne': 'Admin'};

        User.searchUser(query, function(err, user) {
            if (!err) {
                json2csv({data: user,  fields: ['userId', 'firstName', 'lastName', 'scope'], fieldNames: ['User Id/ user email', 'First Name', 'Last Name', 'Userrole']}, function(err, csv) {
                  if (err) console.log(err);
                  return reply(csv).header('Content-Type', 'application/octet-stream').header('content-disposition', 'attachment; filename=user.csv;');
                });
            } else reply(Boom.forbidden(err));
        });
    }
};

exports.login = {
    handler: function(request, reply) {
        User.findUser(request.payload.username, function(err, user) {
            if (!err) {
                if (user === null) return reply(Boom.forbidden("invalid username or password"));
                if (request.payload.password === Crypto.decrypt(user.password)) {
                    if(!user.isActive){
                        reply(Boom.forbidden("User not verified"));
                    }
                    else{
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
                                        username: user.username,
                                        scope: user.scope,
                                        tenantId : user.tenantId,
                                        id: user._id
                                    },
                                    res = {
                                        username: user.username,
                                        scope: user.scope,
                                        tenantId: user.tenantId,
                                        token: Jwt.sign(tokenData, privateKey)
                                    };

                                    reply(res);
                                }
                            });

                    }
                } else reply(Boom.forbidden("invalid username or password"));
            } else {
                if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                    reply(Boom.forbidden("please provide another user name"));
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
        User.findUser(request.payload.username, function(err, user) {
            if (!err) {
                if (user === null) return reply(Boom.forbidden("username does not exist"));
                var password = Crypto.encrypt(Math.random().toString(8).substring(2));
                User.updateUser( user._id, { "password" : password }, function(err, result){
                    if(err){
                        return reply(Boom.badImplementation("Error in sending password"));
                    }
                    else{
                        EmailServices.sentMailForgotPassword(user.username, password);
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
        scope: ['User', 'Tenant-Admin', 'Admin']
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
                    return reply(Boom.forbidden("no user exist"));
                }
            });

       });
    }
};

exports.getUserByAdmin = {
    auth: {
        strategy: 'token',
        scope: ['Admin']
    },
    handler: function(request, reply) {
            User.findUserById(request.params.id, function(err, user) {
                if(err){
                    return reply(Boom.badImplementation("unable to get user detail"));
                }
                else{
                    if(user){
                        user.password = undefined;
                        user.scope = undefined;
                        return reply(user);    
                    }
                    return reply(Boom.forbidden("no user exist"));
                }
            });
    }
};

exports.getUserByTenant = {
    auth: {
        strategy: 'token',
        scope: ['Tenant-Admin']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {     
            User.findUserByIdTenantId(request.params.id, decoded.tenantId, function(err, user) {
                if(err){
                    return reply(Boom.badImplementation("unable to get user detail"));
                }
                else{
                    if(user){
                        user.password = undefined;
                        user.scope = undefined;
                        return reply(user);    
                    }
                    return reply(Boom.forbidden("no user exist"));
                }
            });

       });
    }
};

exports.getAllTenantUserByTenant = {
    auth: {
        strategy: 'token',
        scope: ['Admin', 'Tenant-Admin']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {
            if(decoded.scope === 'Tenant-Admin'){
                request.params.id = decoded.tenantId;
            }
            User.findUserByTenantIdScope(request.params.id, 'User', function(err, user) {
                if(err){
                    return reply(Boom.badImplementation("unable to get user detail"));
                }
                else{
                    if(user.length != 0){
                        for (var i = 0; i< user.length; i++) {
                           if( user[i].password ) { user[i].password = undefined; }
                           if( user[i].scope )  { user[i].scope = undefined; }
                        }
                        return reply(user);    
                    }
                    else{
                        return reply(Boom.forbidden("no user for tenant exist"));
                    }
                }
            });

       });
    }
};


exports.updateUser = {
    auth: {
        strategy: 'token',
        scope: ['Tenant-Admin', 'User']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {

            if(decoded.scope === 'User'){
                request.params.id = decoded.id;
            }
        
            /* filterening unwanted attributes which may have in request.payload and can enter bad data */
            if(request.payload.tenantId) delete request.payload.tenantId;
            if(request.payload.firstLogin) delete request.payload.firstLogin;
            if(request.payload.lastLogin) delete request.payload.lastLogin;
            if(request.payload.createdBy) delete request.payload.createdBy;
            if(request.payload.scope) delete request.payload.scope;
            if(request.payload.password) request.payload.password = Crypto.encrypt(request.payload.password);


            User.updateUser(request.params.id, request.payload, function(err, user) {
                if(err){
                    if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                        reply(Boom.forbidden("user email already registered"));
                    } else return reply( Boom.badImplementation(err) ); // HTTP 403
                }
                else{
                    return reply("user updated successfully");
                }
            });

       });
    }
};