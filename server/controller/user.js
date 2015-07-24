'use strict';

var Boom = require('boom'),
    EmailServices = require('../Utility/emailServices'),
    Crypto = require('../Utility/cryptolib'),
    nodemailer = require("nodemailer"),
    Config = require('../config/config'),
    json2csv = require('json2csv'),
    constants = require('../Utility/constants').constants,
    Jwt = require('jsonwebtoken'),
    async = require("async"),
    ValidateActivity = require('../Utility/validateActivity'),
    Role = require('../model/role').Role,
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
                request.payload.scope = [0];
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
                        EmailServices.sendVerificationEmail(user, tenant, Jwt.sign(tokenData, privateKey));
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
                    delete user.password;
                    return reply(user);
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



exports.createUserSelfRegistration = {
    handler: function(request, reply) {
            if( !request.payload.tenantId ){
                return reply(Boom.forbidden("Please select tenant"));
            }
            else {
                Tenant.findTenantById( request.payload.tenantId, function( err, tenant ) {
                    if( tenant ){
                        request.payload.password = Crypto.encrypt(request.payload.password);
                        request.payload.scope = [2];
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

exports.createUser = function(request, reply){
    if( !request.payload.tenantId ){
        return reply(Boom.forbidden("Please select tenant"));
    }
    else {
        if(request.pre.CU.tenantId === undefined || request.pre.CU.tenantId === request.payload.tenantId) {
            Tenant.findTenantById( request.payload.tenantId, function( err, tenant ) {
                if( tenant ){
                    request.payload.password = Crypto.encrypt(Math.random().toString(36).slice(3));
                    request.payload.createdBy = request.pre.CU.scope[0].label;
                    request.payload.updatedBy = request.pre.CU.scope[0].label;
                    request.payload.isActive = true;
                    request.payload.isEmailVerified = true;
                    var roles = [];
                    User.saveUser( request.payload, function(err, user) {
                        if (!err) {   
                            async.each(user.scope, function(id, callback){
                                Role.findRoleById(id, function(err, role) {
                                    if (!err) {
                                        roles.push(role.label);
                                        callback();
                                    } 
                                });
                            },
                            function(err){
                                if(roles.length > 0) {
                                    for (var i = 0; i < roles.length; i++) {
                                        if(i == 0) user.scope = roles[i];
                                        else user.scope += ", "+roles[i];
                                    };
                                    EmailServices.sendAccountCreationMail(user, tenant);
                                    return reply( "User successfully created" );
                                } else {
                                    reply(Boom.forbidden("User has no role"));
                                }
                            });
                        } else {
                            if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                                return reply(Boom.forbidden("Username has already taken"));
                            } else return reply( Boom.forbidden(err) ); // HTTP 403
                        }
                    });
                }
                else {
                    return reply(Boom.forbidden("Invalid tenant selected"));
                }

            });
        }
        else 
             return reply(Boom.forbidden("Your don't have permission"));
    }
};


// exports.createTenantUserbyTenant = {
//     handler: function(request, reply) {
//         Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) { 
//             if( !request.payload.tenantId ){
//                 return reply(Boom.forbidden("tenant is not assigned"));
//             }
//             else {   
//                     request.payload.password = Crypto.encrypt(Math.random().toString(36).slice(3));
//                     request.payload.createdBy = "Tenant-Admin";
//                     request.payload.updatedBy = "Tenant-Admin";
//                     request.payload.isActive = true;
//                     request.payload.isEmailVerified = true;
                    
//                     User.saveUser( request.payload, function(err, user) {
//                         if (!err) {
//                             var tokenData = {
//                                 userName: user.userName,
//                                 scope: [user.scope],
//                                 id: user._id
//                             };
//                             Tenant.findTenantById(decoded.tenantId, function(err, tenant) {
//                                 if(!err) {
//                                     if(tenant)
//                                         EmailServices.sendAccountCreationMail(user, tenant);
//                                     else
//                                         return reply( 'no tenant with id ');
//                                 }
//                                 else {
//                                     return reply( Boom.forbidden(err) );
//                                 }
//                             });
//                             return reply( "Tenant user successfully created" );
//                         } else {
//                             if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
//                                 return reply(Boom.forbidden("user email already registered"));
//                             } else return reply( Boom.forbidden(err) ); // HTTP 403
//                         }
//                     });
//                 }
//         });
//     }
// };

/**
   POST: /activateUser
   Description: Activate tenant User.
*/
exports.activateUser = function(request, reply){
    var tenantId = request.payload.tenantId;
    User.activateUser(request.payload.id, request.pre.AU.scope[0].label, function(err) {
        if(request.pre.AU.tenantId === undefined || tenantId == request.pre.AU.tenantId) {
            User.findUserById(request.payload.id, function(err, user) {
                if(!err){
                    if(user){
                        if(user.isActive == true) {
                            EmailServices.sendUserActivationMail(user);
                            return reply('Activation email has been sent');   
                        }
                        else 
                            return reply(Boom.forbidden("User is already activated"));
                    }
                }
                else{
                    return reply(Boom.forbidden("Unable to activate user"));
                }
            });
        }
        else {
            return reply(Boom.forbidden("Your don't have permission to activate this user"));
        }
    });

};

/**
   POST: /deActivateUser
   Description: deActivate tenant User.
*/
exports.deActivateUser = function(request, reply){
    var tenantId = request.payload.tenantId;
    if(request.pre.DU.tenantId === undefined || tenantId == request.pre.DU.tenantId) {    
        User.deActivateUser(request.payload.id, request.pre.DU.scope[0].label, function(err) { 
                if(err){
                    return reply(Boom.badImplementation("Unable to deactivate user"));
                }
                else{;
                    User.findUserById(request.payload.id, function(err, user) {
                        if(user){
                            if(user.isActive == false) {
                                EmailServices.sentMailUserDeactivation(user);
                                return reply('Deactivation email has been sent');
                            }
                            else  
                              return reply(Boom.forbidden("User is already deactivated"));  
                        }
                        else return reply(Boom.forbidden("no user exist"));
                    });
                }
        });
    }
    else 
        return reply(Boom.forbidden("Your don't have permission to activate this user"));
    
};

/**
   POST: /activateUser
   SCOPE: 'Admin', 'Tenant-Admin'
   Description: Activate tenant User.
*/
exports.changePasswordRequest = {
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) { 
            User.findUserById(decoded.id, function(err, user) {

                if(Crypto.decrypt(user.password) == request.payload.oldpass) {
                    User.updateUser(decoded.id, {"password": Crypto.encrypt(request.payload.newpass)}, function(err) {
                        if(err){
                            return reply(Boom.badImplementation("unable to change password"));
                        }
                        else{
                            if(user){
                                return reply('password has changed successfully');    
                            }
                            return reply(Boom.forbidden("no user exist"));
                        }
                    });
                }
                else
                    return reply(Boom.forbidden("incorrect password"));
            });
       });
    }
};


/**
   POST: /sendCredentials
   SCOPE: 'Admin', 'Tenant-Admin'
   Description: deActivate tenant User.
*/
exports.sendCredentials = {
    handler: function(request, reply) {
        EmailServices.sendAccountCredentialsToUser(request.payload.user);
        return reply('account credentials email has sent');    
    }
};

/**
    POST: /searchUser
    SCOPE: 'Admin'
    Description: Search User based on certain field/criteria (firstName, lastName, email, tenantId).
*/
exports.searchUser =  function(request, reply) {    
    var query = {};
    if (request.payload.username) query['username'] = new RegExp(request.payload.username, "i");
    if (request.payload.firstName) query['firstName'] = new RegExp(request.payload.firstName, "i");
    if (request.payload.lastName) query['lastName'] = new RegExp(request.payload.lastName, "i");
    if (request.payload.email) query['email'] = new RegExp(request.payload.email, "i");
    if (request.payload.tenantId) query['tenantId'] = request.payload.tenantId;
    if (request.payload.isActive) query['isActive'] = request.payload.isActive;
    if (request.payload.scope) query['scope'] = {'$all': request.payload.scope}

    query['isEmailVerified'] = {'$ne': 'false'};

    User.searchUser(query, function(err, users) {
        if (!err) {
            async.each(users, function(user, callback){
                if( user.password ) { user.password = undefined; }
                var roleList = [];
                    Role.findRoles(user.scope, function(err, roles) {
                        if(!err) {
                             for (var i = 0; i < roles.length; i++) {
                                 user.scope[i] = roles[i].label;
                             };
                             callback();
                        }
                        else reply(Boom.forbidden(err));
                    });
                },
                    function(err){
                        return reply(users);
                    }
                );  
        } else reply(Boom.forbidden(err));
    });
};

/**
    GET: /sendEmailToAdmins
    Description: Get admins list.
*/
exports.sendActivationEmail = {
    handler: function(request, reply) {
            // sendEmailToAdminEmailList(request.payload.user);
            sendEmailToTenantAdminEmailList(request.payload.user);            
            return reply('Emails have sent');
    }
}
/**
    GET: /admins
    Description: Get admins list.
*/
var sendEmailToAdminEmailList = function(user) {
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
                EmailServices.sentUserActivationMailToAdmins(emailList, user);
            }
        });
};
/**
    GET: /tenantAdmins
    Description: Get admins list.
*/
var sendEmailToTenantAdminEmailList = function(user) {
        var emailList,
            query = {};
        query['tenantId'] = user.tenantId;
        query['scope'] = 'Tenant-Admin';

        User.searchUser(query, function(err, userList) {
            if (!err) {
                for(var j in userList)  
                {
                    if(emailList) emailList+=","+userList[j].email;
                    else emailList = userList[j].email
                }  
                EmailServices.sentUserActivationMailToTenantAdmins(emailList, user);
            }
        });
};

exports.usernameSuggestions = {
    handler: function(request, reply) {

        var suggestions = [];
            var possible = request.payload.email.split('@')[0];
            if (possible.indexOf('.') > -1) {
                suggestions = possible.split('.');
                suggestions.push(suggestions[1]+Math.floor(Math.random() * possible.length)+1  );   
            }
            else if (possible.indexOf('_') > -1)  {
                suggestions = possible.split('_');
                suggestions.push(suggestions[1]+Math.floor(Math.random() * possible.length)+1  );   
            }       
            else {
                suggestions.push(possible);
            }
            suggestions.push(suggestions[0]+Math.floor(Math.random() * possible.length)+1  );  
            
            //pushing records with random number
            for (var i = 0; i < 3; i++) {
                var name = possible.split('.')[0]+Math.floor(Math.random() * 1000);  
                if(isDuplicated(suggestions, name) === false) 
                    suggestions.push(name); 
            };
            //checking record is in db or not
            var suggestionsList = [];
            async.each(suggestions, function(suggestion, callback){
                 User.findUserByName(suggestion, function(err, user) {
                        if (!err) {
                            if(user === null) suggestionsList.push(suggestion);
                            callback();
                        } 
                    
                }); 
            },
            function(err){
                reply(suggestionsList);
            });

           
    }
};

var isDuplicated = function (array, name) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if(array[i] === name) count++;
    };
    if(count > 0) return true;
    else return false;
}

exports.exportUser = function(request, reply){
        var query = {};
            query['isEmailVerified'] = {'$ne': 'false'};
        var fieldsArray = ['username', 'email', 'firstName', 'lastName', 'roles', 'isActive'];
        var fieldNamesArray = ['User Name', 'Email', 'First Name', 'Last Name', 'User Role', 'Active'];
        User.searchUser(query, function(err, users) {
            if (!err) {
                var list = JSON.parse(JSON.stringify(users));
                async.each(list, function(user, callback){
                    user.roles = {};
                    Role.findRoles(user.scope, function(err, role){
                        if(!err){
                            for (var i = 0; i < role.length; i++) {
                                user.scope[i] = role[i].label;
                            };
                            user.roles = user.scope.toString();
                            
                            callback();                
                        }
                        else reply(Boom.forbidden(err));
                    });
                 },
                function(err){
                    json2csv({data: list, fields: fieldsArray, fieldNames: fieldNamesArray}, function(err, csv) {
                      if (err) console.log(err);
                      return reply(csv).header('Content-Type', 'application/octet-stream').header('content-disposition', 'attachment; filename=user.csv;');
                    });
                });
            } else reply(Boom.forbidden(err));
        });
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
                                    Role.findRoles(user.scope, function(err, role){
                                        if(!err) {
                                            var roles = [];
                                            for (var i = 0; i < role.length; i++) {
                                                roles.push(role[i].id)
                                                if(i === 0 ) 
                                                   var permissions = role[i].permissions;
                                                else {
                                                    for (var j = 0; j < role[i].permissions.length; j++) {
                                                        if(permissions.indexOf(role[i].permissions[j]) === -1)
                                                            permissions.push(role[i].permissions[j]);
                                                    };
                                                }
                                            };
                                            
                                            var tokenData = {
                                                username: user.username,
                                                scope: role,
                                                tenantId : user.tenantId,
                                                id: user._id
                                            },
                                            res = {
                                                username: user.username,
                                                scope: roles,
                                                tenantId: user.tenantId,
                                                permissions: permissions,
                                                token: Jwt.sign(tokenData, privateKey)
                                            };

                                            reply(res);
                                        }
                                        else  reply(Boom.forbidden("Oops something went wrong!"));
                                    });
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
                        EmailServices.sentMailForgotPassword(user);
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
        strategy: 'token'
    },
    handler: function(request, reply) {
       Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {        
            User.findUserById(decoded.id, function(err, user) {
                if(err){
                    return reply(Boom.badImplementation("unable to get user detail"));
                }
                else{
                    if(user){
                        Role.findRoles(user.scope, function(err, role) {
                            user.password = undefined;
                            return reply(user);    
                        });
                    }
                    else return reply(Boom.forbidden("no user exist"));
                }
            });

       });
    }
};

/**
    GET: /user/{username}
    @param id : username of User whose info is to be get
    Description: Get User's information.
*/
exports.getUserByName = function(request, reply){
        User.findUserByName(request.params.username, function(err, user) {
            if(!err){
                if(request.pre.UBN.tenantId === undefined || user.tenantId._id == request.pre.UBN.tenantId) {
                    if(user){
                        user.password = undefined;
                        return reply(user);    
                    }
                    return reply(Boom.forbidden("no user exist"));
                }
                else
                    return reply(Boom.forbidden("You don't have permission"));
            }
            else
                return reply(Boom.forbidden("Unableto get user information"));
        });
   
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

exports.getAllTenantUsersOfTenant =  function(request, reply) {
        if(request.pre.GTU.tenantId === undefined || request.pre.GTU.tenantId === request.params.id) {
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
        }
        else return reply(Boom.forbidden("You don't have permission"));

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

exports.updateAccount = {
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
    @param id : user id of Tenant User whose info need to be edited.
    @param tenantId : tenant id of tenant whose use info is to be updated.
    Description: Update Tenant User info by System Admin.
 */

exports.updateUser = function(request, reply){
    if((request.pre.UU.tenantId === undefined) || (request.pre.UU.tenantId === request.params.tenantId)) {
        /* filterening unwanted attributes which may have in request.payload and can enter bad data */
        if(request.payload.tenantId) delete request.payload.tenantId;
        if(request.payload.firstLogin) delete request.payload.firstLogin;
        if(request.payload.lastLogin) delete request.payload.lastLogin;
        if(request.payload.createdBy) delete request.payload.createdBy;
        request.payload.updatedBy = request.pre.UU.scope[0].label;
        // if(request.payload.scope) delete request.payload.scope;
        //if(request.payload.password) request.payload.password = Crypto.encrypt(request.payload.password);
        
        User.updateUserDetails(request.params.id, request.params.tenantId, request.payload, function(err, user) {
            if(err){
                if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                    reply(Boom.forbidden("user email already registered"));
                } else return reply( Boom.badImplementation(err) ); // HTTP 403
            }
            else{
                return reply("user updated successfully");
            }
        });
    }
    else 
        reply(Boom.forbidden("You don't have permission"));
};

/**
    DELETE: /user/{id}
    @param id : user id of Tenant User whose info need to be deleted.
    Description: Delete Tenant User info by System Admin.
 */

exports.deleteUser = function(request, reply){
    if(request.pre.DU.tenantId === undefined || request.pre.DU.tenantId === request.params.tenantId) {
        User.remove(request.params.id, function(err, user) {
            if(err){
              return reply( Boom.badImplementation(err) ); // HTTP 403
            }
            else{
                return reply('User account sucessfully deleted')
            }
        });
    }
    else
        return reply(Boom.forbidden("You don't have permission"));
};