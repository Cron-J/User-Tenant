'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    constants = require('../Utility/constants').constants,
    validator = require('mongoose-validators');

/** 
 * @module tenant
 * @description tenant class contains the details of tenant
 */

var Role = new Schema({

    /**
     * name must be string and required field
     */
    name: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isLength(2,30), validator.matches(constants.nameRegex)]
    }
});

Tenant.statics.findRoleByName = function(name, callback) {
    this.findOne({
        'name': name
    }, callback);
};

Tenant.statics.remove = function(id, callback) {
    this.find({
        _id: id
    }).remove(callback);
};

var role = mongoose.model('Role', Role);

module.exports = {
    Role: role
};