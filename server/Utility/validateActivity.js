var Boom = require('boom'),
    Config = require('../config/config'),
    Jwt = require('jsonwebtoken'),
    async = require("async"),
    Role = require('../model/role').Role,
    Tenant = require('../model/tenant').Tenant,
    User = require('../model/user').User;

exports.accessActivity = function(roles, aId) {
		var roleList = [];
		for (var i = 0; i < roles.length; i++) {
			if(i==0) roleList = roles[i].permissions;
			else {
				for (var j = 0; j < roles[i].permissions.length; j++) {
					if(roleList.indexOf(roles[i].permissions[j]) === -1)
							roleList.push(roles[i].permissions[j]);
				}
			}
		};

		if(roleList.indexOf(aId) >= 0) return true;
		else false;
};