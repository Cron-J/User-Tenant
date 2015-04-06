var Joi = require('joi'),
    Boom = require('boom'),
    Common = require('./common'),
    Config = require('../config/config'),
    Jwt = require('jsonwebtoken'),
    User = require('../model/user').User;

var privateKey = Config.key.privateKey;

exports.create = {
    handler: function(request, reply) {
        request.payload.password = Common.encrypt(request.payload.password);
        request.payload.scope = "Admin";
        User.saveUser(request.payload, function(err, user) {
            if (!err) {
                var tokenData = {
                    userId: user.userId,
                    scope: [user.scope],
                    id: user._id
                };
                reply("user successfully created");
            } else {
                if (11000 === err.code || 11001 === err.code) {
                    reply(Boom.forbidden("user email already registered"));
                } else reply(Boom.forbidden(err)); // HTTP 403
            }
        });
    }
};

exports.login = {
    handler: function(request, reply) {
        User.findUser(request.payload.userName, function(err, user) {
            if (!err) {
                if (user === null) return reply(Boom.forbidden("invalid username or password"));
                if (request.payload.password === Common.decrypt(user.password)) {


                    var tokenData = {
                        userId: user.userId,
                        scope: [user.scope],
                        id: user._id
                    };
                    var res = {
                        userId: user.userId,
                        scope: user.scope,
                        token: Jwt.sign(tokenData, privateKey)
                    };

                    reply(res);
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
                Common.sentMailForgotPassword(user);
                reply("password is send to registered email id");
            } else {       
                console.error(err);
                return reply(Boom.badImplementation(err));
             }
        });
    }
};