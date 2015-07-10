'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    constants = require('../Utility/constants').constants,
    validator = require('mongoose-validators'),
    db = require('../config/db').db,
    autoIncrement = require('mongoose-auto-increment'),
    async = require("async");
    autoIncrement.initialize(db);

/** 
 * @module tenant
 * @description tenant class contains the details of tenant
 */

var Role = new Schema({
    /**
     * id must be number and required field
     */
    id: {
        type: Number,
        required: true,
        unique: true,
    },

    /**
     * label must be string and required field
     */
    label: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isLength(2,30), validator.matches(constants.nameRegex)]
    }
});

Role.statics.saveRole = function(requestData, callback) {
    this.create(requestData, callback);
};

Role.statics.findRoles = function(array, callback) {
        this.findOne({
            'id': { $in: array}
        }, callback);
};

Role.statics.findRoleById = function(id, callback) {
        this.findOne({
             "id": id
        }, callback);
};

Role.statics.getList = function(query, callback) {
    this.find(query, callback);
};

Role.statics.remove = function(id, callback) {
    this.find({
        _id: id
    }).remove(callback);
};

Role.plugin(autoIncrement.plugin,{ model: 'role', field: 'id' });
var role = mongoose.model('Role', Role);

module.exports = {
    Role: role
};