'use strict';

var Boom = require('boom'),
    EmailServices = require('../Utility/emailServices'),
    Crypto = require('../Utility/cryptolib'),
    nodemailer = require("nodemailer"),
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
                request.payload.createdBy = "Admin";
                request.payload.updatedBy = "Admin";
                request.payload.isActive= true;
                request.payload.isEmailVerified = true;

                User.saveUser( request.payload, function(err, user) {
                    if (!err) {
                        var tokenData = {
                            userName: user.userName,
                            scope: [user.scope],
                            id: user._id
                        };
                        EmailServices.sendVerificationEmail(user, Jwt.sign(tokenData, privateKey));
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
//

exports.emailVerification = {
    handler: function(request, reply) {
     
            var username = Crypto.decrypt(request.payload.username);
            User.findUser(username, function(err, user){
                if (err) {
                    return reply(Boom.badImplementation(err));
                }
                else if (user === null) return reply(Boom.forbidden("invalid verification link"));
                else if (user.isEmailVerified === true) return reply(Boom.forbidden("account is already verified"));
                else if (user.isEmailVerified === false) {
                    user.isEmailVerified = true;
                    user.save();
                    return reply(user.scope+" account sucessfully verified");
                } else {
                    reply(Boom.forbidden("invalid verification link"));
                }
            })
    }
};
exports.resendVerificationMail = {
    handler: function(request, reply) {

        User.findUser(request.payload.username, function(err, user) {
            if (!err) {
                if (user === null) return reply(Boom.forbidden("invalid username or password"));
                if (user) {

                    if(user.isEmailVerified) return reply("your email address is already verified");
                    else {
                        var tokenData = {
                            userName: user.userName,
                            scope: [user.scope],
                            id: user._id
                        };
                        EmailServices.resentMailVerificationLink(user,Jwt.sign(tokenData, privateKey));
                        reply("account verification link is sucessfully sent to your registered email id");
                    }
                } else reply(Boom.forbidden("invalid username or password"));
            } else {                
                console.error(err);
                return reply(Boom.badImplementation(err));
            }
        });
    }
};

/**
 * Sends an email.
 * @function
 */
var sendMail = function () {
  var transporter
    , message;

  transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
      user: 'postmaster@sandboxf10e903026724576a2e218a65d72301d.mailgun.org', // postmaster@sandbox[base64 string].mailgain.org
      pass: 'cronj123' // You set this.
    }
  });
  message = {
    from: 'jCatalog',
    to: 'anusha.nilapu@gmail.com', // comma separated list
    subject: 'Activate User',
    text: 'Text contents.',
    html: '<p>Hi Admin,</p><p>Please activate this user account</p>'
  };
  transporter.sendMail(message, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Sent: ' + info.response);
    }
  });
};


exports.createUser = {
    handler: function(request, reply) {
            if( !request.payload.tenantId ){
                return reply(Boom.forbidden("Please select tenant"));
            }
            else {
                Tenant.findTenantById( request.payload.tenantId, function( err, tenant ) {
                    if( tenant ){
                        request.payload.password = Crypto.encrypt(request.payload.password);
                        request.payload.scope = "User";
                        request.payload.createdBy = "Self";
                        request.payload.updatedBy = "Self";
                        User.saveUser( request.payload, function(err, user) {
                            if (!err) {
                                var tokenData = {
                                    userName: user.userName,
                                    scope: [user.scope],
                                    id: user._id
                                };
                                //Sending emails to admins to activate account
                                // EmailServices.sentUserActivationMailToAdmins(getAdminEmailList(), user);
                                //Sending verification email
                                EmailServices.sendVerificationEmail(user, Jwt.sign(tokenData, privateKey));
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

exports.createTenantUser = {
    handler: function(request, reply) {
            if( !request.payload.tenantId ){
                return reply(Boom.forbidden("Please select tenant"));
            }
            else {
                Tenant.findTenantById( request.payload.tenantId, function( err, tenant ) {
                    if( tenant ){
                        request.payload.password = Crypto.encrypt(Math.random().toString(8).substring(2));
                        request.payload.createdBy = "Admin";
                        request.payload.updatedBy = "Admin";
                        request.payload.isActive = true;
                        
                        User.saveUser( request.payload, function(err, user) {
                            if (!err) {
                                var tokenData = {
                                    userName: user.userName,
                                    scope: [user.scope],
                                    id: user._id
                                };
                                EmailServices.sendVerificationEmail(user, Jwt.sign(tokenData, privateKey));
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


exports.createTenantUserbyTenant = {
    handler: function(request, reply) {
        if( !request.payload.tenantId ){
            return reply(Boom.forbidden("tenant is not assigned"));
        }
        else {   
                request.payload.password = Crypto.encrypt(Math.random().toString(8).substring(2));
                request.payload.createdBy = "Tenant-Admin";
                request.payload.updatedBy = "Tenant-Admin";
                request.payload.isActive = true;
                
                User.saveUser( request.payload, function(err, user) {
                    if (!err) {
                        var tokenData = {
                            userName: user.userName,
                            scope: [user.scope],
                            id: user._id
                        };
                        EmailServices.sendVerificationEmail(user, Jwt.sign(tokenData, privateKey));
                        return reply( "Tenant user successfully created" );
                    } else {
                        if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                            return reply(Boom.forbidden("user email already registered"));
                        } else return reply( Boom.forbidden(err) ); // HTTP 403
                    }
                });
            }
    }
};

/**
   POST: /activateUser
   SCOPE: 'Admin', 'Tenant-Admin'
   Description: Activate tenant User.
*/
exports.activateTenantUser = {
    auth: {
        strategy: 'token',
        scope: ['Tenant-Admin', 'Admin']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) { 
            var tenantId;
            if(decoded.scope === 'Admin'){
                tenantId = request.payload.tenantId;
            }
            else{
                tenantId = decoded.tenantId;
            }
            User.activateUser(request.payload.id, tenantId, function(err, user) {
                console.log(err);
                if(err){
                    return reply(Boom.badImplementation("unable to activate user"));
                }
                else{
                    if(user){
                        EmailServices.sentMailUserActivation(user.name, user.password);
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

/**
   POST: /deActivateUser
   SCOPE: 'Admin', 'Tenant-Admin'
   Description: deActivate tenant User.
*/
exports.deActivateTenantUser = {
    auth: {
        strategy: 'token',
        scope: ['Tenant-Admin', 'Admin']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {     
            var tenantId;
            if(decoded.scope === 'Admin'){
                tenantId = request.payload.tenantId;
            }
            else{
                tenantId = decoded.tenantId;
            }

            User.deActivateUser(request.payload.id, tenantId, function(err, user) {
                if(err){
                    return reply(Boom.badImplementation("unable to deactivate user"));
                }
                else{
                    if(user){
                        EmailServices.sentMailUserDeactivation(user.name, user.password);
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

/**
    POST: /searchUser
    SCOPE: 'Admin'
    Description: Search User based on certain field/criteria (firstName, lastName, email, tenantId).
*/
exports.searchUser = {
    auth: {
        strategy: 'token',
        scope: ['Admin', 'Tenant-Admin']
    },
    handler: function(request, reply) {
        var query = {};
        if (request.payload.username) query['username'] = new RegExp(request.payload.username, "i");
        if (request.payload.firstName) query['firstName'] = new RegExp(request.payload.firstName, "i");
        if (request.payload.lastName) query['lastName'] = new RegExp(request.payload.lastName, "i");
        if (request.payload.email) query['email'] = new RegExp(request.payload.email, "i");
        if (request.payload.tenantId) query['tenantId'] = request.payload.tenantId;
        if (request.payload.isActive) query['isActive'] = request.payload.isActive;
        if (request.payload.scope) query['isActive'] = request.payload.scope;
        query['isEmailVerified'] = {'$ne': 'false'};

        User.searchUser(query, function(err, user) {
            if (!err) {
                for (var i = 0; i< user.length; i++) {
                   if( user[i].password ) { user[i].password = undefined; }
                }
                console.log(user);
                return reply(user);
            } else reply(Boom.forbidden(err));
        });
        
        // EmailServices.sentUserActivationMailToAdmins();
    }
};

/**
    GET: /admins
    Description: Get admins list.
*/
var getAdminEmailList = function() {
        var emailList,
            query = {};
        query['scope'] = 'Admin';

        User.searchUser(query, function(err, userList) {
            if (!err) {
                for(var j in userList)  
                {
                    if(emailList) emailList+=","+userList[j].email;
                    else emailList = userList[j].email
                }    
                return emailList;
            }
        });
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
                json2csv({data: user,  fields: ['username', 'firstName', 'lastName', 'email', 'scope', 'isActive'], fieldNames: ['User name', 'First Name', 'Last Name', 'Email', 'Userrole', 'Active']}, function(err, csv) {
                  if (err) console.log(err);
                  return reply(csv).header('Content-Type', 'application/octet-stream').header('content-disposition', 'attachment; filename=user.csv;');
                });
            } else reply(Boom.forbidden(err));
        });
    }
};

/**
    POST: /login
    SCOPE: Open for all
    Description: Login user.
*/

exports.login = {
    handler: function(request, reply) {
        User.findUser(request.payload.username, function(err, user) {
            if (!err) {
                if (user === null) return reply(Boom.forbidden("invalid username or password"));
                if (request.payload.password === Crypto.decrypt(user.password)) {
                    if (!user.isEmailVerified){
                        reply(Boom.forbidden("Email is not verified"));
                    }
                    else if(!user.isActive){
                        reply(Boom.forbidden("Account is not activated"));
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

/**
    POST: /forgotPassword
    SCOPE: Open for all
    Description: Email will be send to user email.
*/

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
                        EmailServices.sentMailForgotPassword(user.email, user.username, password);
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

/**
    GET: /user
    Description: Get User own information.
*/
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

/**
    GET: /user/{id}
    @param id : user id of Tenant User whose info is to be get
    Description: Get User own information.
*/

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
                        // user.scope = undefined;
                        return reply(user);    
                    }
                    return reply(Boom.forbidden("no user exist"));
                }
            });
    }
};

/**
    GET: /user/{id}
    @param id : user id of Tenant User whose info is to be get
    Description: Get Tenant User information.
*/

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
                        // user.scope = undefined;
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
                        return reply(user);
                    }
                }
            });

       });
    }
};

exports.getAllDeactiveTenantUserByTenant = {
    auth: {
        strategy: 'token',
        scope: ['Admin', 'Tenant-Admin']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {
            if(decoded.scope === 'Tenant-Admin'){
                request.params.id = decoded.tenantId;
            }
            User.findDeactiveUserByTenantId(request.params.id, function(err, user) {
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
                        return reply(user);
                    }
                }
            });

       });
    }
};

/**
   PUT: /user
   SCOPE: 'Admin', 'Tenant-Admin', 'User'
   Description: Update own info for one who is logged in i.e. Admin, Tenant Admin, Tenant User.
 */

exports.updateUser = {
    auth: {
        strategy: 'token',
        scope: ['Admin', 'Tenant-Admin', 'User']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {
            /* filterening unwanted attributes which may have in request.payload and can enter bad data */
            if(request.payload.tenantId) delete request.payload.tenantId;
            if(request.payload.firstLogin) delete request.payload.firstLogin;
            if(request.payload.lastLogin) delete request.payload.lastLogin;
            if(request.payload.createdBy) delete request.payload.createdBy;
            if(request.payload.scope) delete request.payload.scope;
            if(request.payload.password) request.payload.password = Crypto.encrypt(request.payload.password);
            request.payload.updatedBy = "Self";

            User.updateUser(decoded.id, request.payload, function(err, user) {
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

/**
    PUT: /user/{id}
    PUT: /user/{id}/{tenantId}
    SCOPE: 'Admin', 'Tenant-Admin'
    @param id : user id of Tenant User whose info need to be edited.
    @param tenantId : tenant id of tenant whose use info is to be updated.
    Description: Update Tenant User info by System Admin.
 */

exports.updateTenantUser = {
    auth: {
        strategy: 'token',
        scope: ['Tenant-Admin','Admin']
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {
 
        
            /* filterening unwanted attributes which may have in request.payload and can enter bad data */
            if(request.payload.tenantId) delete request.payload.tenantId;
            if(request.payload.firstLogin) delete request.payload.firstLogin;
            if(request.payload.lastLogin) delete request.payload.lastLogin;
            if(request.payload.createdBy) delete request.payload.createdBy;
            // if(request.payload.scope) delete request.payload.scope;
            if(request.payload.password) request.payload.password = Crypto.encrypt(request.payload.password);

            request.payload.updatedBy = decoded.scope;
            var tenantId;

            if(decoded.scope === 'Tenant-Admin'){
                tenantId = decoded.tenantId;    
            }
            else{
                tenantId = request.params.tenantId;
            }
            
            User.updateUserByTenantId(request.params.id, tenantId, request.payload, function(err, user) {
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