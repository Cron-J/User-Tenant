var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp'),
    constants = require('../Utility/constants').constants,
    validator = require('mongoose-validators'),
    Address = require('./address').Address;

/**
 * @module  User
 * @description contain the details of Attribute
 */

var User = new Schema({

    /** 
      userId. It can only contain valid email id, should be unique, is required and indexed.
    */
    userId: {
        type: String,
        unique: true,
        required: true,
        validate: [validator.matches(constants.eMailRegex)]
    },

    /** 
      password. It can only contain string, is required field.
    */
    password: {
        type: String,
        required: true
    },

    /** 
      Scope. It can only contain string, is required field, and should have value from enum array.
    */
    scope: {
        type: String,
        enum: ['Admin', 'Tenant', 'Tenant-User'],
        required: true
    },

    /** 
      firstName. It can only contain string.
    */
    firstName: {
        type: String,
        required: true,
        validate: [validator.isLength(2,30), validator.matches(constants.nameRegex)]
    },

    /** 
      lastName. It can only contain string.
    */
    lastName: {
        type: String,
        required: true,
        validate: [validator.isLength(2,30), validator.matches(constants.nameRegex)]
    },

    /** 
      Address. It stores address information.
    */

    address: Address,

    /**
     * User name who has created the User.
     */
    createdBy: {
        type: String,
        enum: ['Self', 'Admin', 'Tenant-Admin']
    },

    /**
     * User name who has changed the User last time.
     */
    updatedBy: {
        type: String,
        enum: ['Self', 'Admin', 'Tenant-Admin']
    },

    /**
     * User last login timestamp.
     */
    lastLogin:{
        type: Date
    },

    /**
     * User first login timestamp.
     */
    firstLogin:{
        type: Date
    }

});


/**
 * Date when the Product was created.
 * Date when the Product was changed last time.
 */
User.plugin(timestamps);


User.statics.saveUser = function(requestData, callback) {
    var user = new this(requestData);
    user.save(callback);
};

User.statics.updateUser = function(id, user, callback) {
    this.update({
        '_id': id
    }, user, callback);
};

User.statics.findUser = function(userId, callback) {
    this.findOne({
        userId: userId
    }, callback);
};


var user = mongoose.model('user', User);

/** export schema */
module.exports = {
    User: user
};