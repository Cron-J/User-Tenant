var Boom = require('boom'),
    Config = require('../config/config'),
    Jwt = require('jsonwebtoken'),
    constants = require('../Utility/constants').constants,
    Crypto = require('../Utility/cryptolib'),
    Activity =  require('../model/activity').Activity,
    Role =  require('../model/role').Role,
    async = require("async");
    var privateKey = Config.key.privateKey;

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
            console.log('********************');
            console.log(permissions.indexOf(pId));
            if(permissions.indexOf(pId) > -1)
                return reply(decoded);
            else
                reply(Boom.forbidden( "You are not authorized" ));
        });
}