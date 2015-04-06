'use strict';

var crypto = require('crypto'),
	config = require('../config/config'),
    algorithm = 'aes-256-ctr';

var privateKey = config.key.privateKey;

// method to decrypt data(password)
exports.decrypt = function(password) {
    var decipher = crypto.createDecipher(algorithm, config.key.privateKey);
    var dec = decipher.update(password, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

// method to encrypt data(password)
exports.encrypt = function(password) {
    var cipher = crypto.createCipher(algorithm, config.key.privateKey);
    var crypted = cipher.update(password, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};