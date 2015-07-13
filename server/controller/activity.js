'use strict';

var Boom = require('boom'),
    Config = require('../config/config'),
    Jwt = require('jsonwebtoken'),
    constants = require('../Utility/constants').constants,
    Crypto = require('../Utility/cryptolib'),
    Activity =  require('../model/activity').Activity,
    async = require("async");

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


