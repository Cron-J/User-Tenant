'use strict';

var Boom = require('boom'),
    Config = require('../config/config'),
    Jwt = require('jsonwebtoken'),
    constants = require('../Utility/constants').constants,
    Crypto = require('../Utility/cryptolib'),
    Role =  require('../model/role').Role,
    async = require("async");

exports.createRoles = {
    handler: function(request, reply) {
        var roles = Config.roles;
        async.each(roles, function(role, callback){
                Role.saveRole(role, function(err, callback){
                    if(err) {
                        if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                            reply(Boom.forbidden( "Role(s) already exist" ));
                        } else reply( Boom.forbidden( err ) );
                    }
                    else reply('Role(s) Created');
                });
        });
    }
};

exports.getRoles = {
    handler: function(request, reply) {
        Role.getList({}, function(err, result){
            if(!err) {
                return reply(result);
            }
            else reply(err);
        });
    }
};

//hapi-route-acl
exports.permissionsFunc = function(credentials, callback) {
  // use credentials here to retrieve permissions for user
  // in this example we just return some permissions
  Role.getList({}, function(err, result){
             var userPermissions = {
                cars: {
                  read: true,
                  create: false,
                  edit: true,
                  delete: true
                },
                drivers: {
                  read: true,
                  create: false,
                  edit: false,
                  delete: false
                }
              };
  });

 

  callback(null, userPermissions);
};

