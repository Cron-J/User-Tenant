'use strict';

var Boom = require('boom'),
    Config = require('../config/config'),
    Jwt = require('jsonwebtoken'),
    constants = require('../Utility/constants').constants,
    Crypto = require('../Utility/cryptolib'),
    Activity =  require('../model/activity').Activity,
    Role =  require('../model/role').Role,
    async = require("async");
    var privateKey = Config.key.privateKey;

exports.createActivities = {
    handler: function(request, reply) {
        var activities = Config.activities;
        async.each(activities, function(activity, callback){
                Activity.saveActivity(activity, function(err, callback){
                    if(err) {
                        if ( constants.kDuplicateKeyError === err.code || constants.kDuplicateKeyErrorForMongoDBv2_1_1 === err.code ) {
                            reply(Boom.forbidden( "Activity(s) already exist" ));
                        } else reply( Boom.forbidden( err ) );
                    }
                    else reply('Activities Created');
                });
        });
    }
};

exports.getActivitiesList = {
    handler: function(request, reply) {
        Activity.getActivityList({}, function(err, result){
            if(!err) {
                return reply(result);
            }
            else reply(err);
        });
    }
};

//hapi-route-acl
var permissionsFunc = function(credentials, callback) {
    console.log('asdadsa',credentials);
  // use credentials here to retrieve permissions for user
  // in this example we just return some permissions
    var userPermissions={};
    Activity.getActivityList({}, function(err, activities){
        if(!err) {
            Role.getList({}, function(err, roles){
                if(!err) {
                    for (var i = 0; i < roles.length; i++) {
                         userPermissions[roles[i].id] = {};
                        for (var j = 0; j < activities.length; j++) {
                          if(roles[i].permissions.indexOf(activities[j].aId) > -1) 
                                userPermissions[roles[i].id][activities[j].name] = true; 
                            else 
                                userPermissions[roles[i].id][activities[j].name] = false;
                        };
                    }
                    callback(null, userPermissions);
                }

        return userPermissions;
            });
            
        }
        else reply(err);
    });

};

var permissionsSet = function (array) {
    var list = [];
    for (var i = 0; i < array.length; i++) {
        if(i == 0) list = array[i].permissions;
        else {
            for (var j = 0; j < array[i].permissions.length; j++) {
                if(list.indexOf(array[i].permissions[j]) === -1)
                    list.push(array[i].permissions[j]);
            };
        }
    };
    return list;
}

exports.checkPermission = function(request, reply) {
    var pId = request.route.settings.app.permissionLevel;
    Jwt.verify(request.headers.authorization.split(' ')[1], Config.key.privateKey, function(err, decoded) {    
            var permissions = permissionsSet(decoded.scope);
            if(permissions.indexOf(pId) > -1)
                return reply(true);
            else
                reply(Boom.forbidden( "You don't have permission." ));
        });
}

