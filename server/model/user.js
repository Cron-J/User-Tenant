'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    constants = require('../Utility/constants').constants,
    validator = require('mongoose-validators');

/**
 * @module  User
 * @description contain the details of Attribute
 */

var User = new Schema({

    /** 
      user Name, for login; must be a string, unique, required, should have minimum length 3 and maximum 20.
    */
    username: {
        type: String,
        unique: true,
        required: true,
        min: 3,
        max: 20
    },
    /** 
      user first Name; must be a string, unique, required, should have minimum length 3 and maximum 20.
    */
    firstName: {
        type: String,
        trim: true,
        required: true,
        min: 3,
        max: 20
    },
    /** 
      user last Name; must be a string, unique, required, should have minimum length 3 and maximum 20.
    */
    lastName: {
        type: String,
        trim: true,
        required: true,
        min: 3,
        max: 20
    },
    /** 
      user email; must be a valid email, lowercase, required, should have minimum length 5 and maximum 50.
    */
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        min: 5,
        max: 50
    },
    /** 
      user password; must be string, required, should have minimum length 5 and maximum 50.
    */
    password: {
        type: String,
        min: 5,
        required: true,
        max: 50
    },
    /**
     * User creation timestamp.
     */
    createdAt: {
        type: Date
    },

    /**
     * User updation timestamp.
     */
    updatedAt: {
        type: Date
    },
    /**
     * createdBy must be string who has created user.
     */
    createdBy: {
        type: String
    },
    /**
     * updatedBy must be string who has updated user recently.
     */
    updatedBy: {
        type: String
    },
    /**
     * User last login timestamp.
     */
    lastLogin: {
        type: Date
    },
    /**
     * User first login timestamp.
     */
    firstLogin: {
        type: Date
    },
    tenantId: {
        type: ObjectId,
        ref: 'Tenant'
    },
    isActive: {
        type: Boolean,
        default: false
    },

    /** 
      Scope. It can only contain string, is required field, and should have value from enum array.
    */
    scope: {
        type: String,
        enum: ['Admin', 'Tenant-Admin', 'User'],
        required: true
    }

});


User.statics.saveUser = function(requestData, callback) {
    requestData.createdAt = new Date();
    requestData.updatedAt = new Date();
    this.create(requestData, callback);
};

User.statics.updateUser = function(id, user, callback) {
    if (user.createdAt) {
        delete user.createdAt;
    }
    user.updatedAt = new Date();
    this.update({
        '_id': id
    }, user, callback);
};

User.statics.activateUser = function(id, tenantId, callback) {
    this.update({
        '_id': id,
        'scope': 'User',
        'tenantId': tenantId
    }, {'isActive': true}, callback);
};

User.statics.deActivateUser = function(id, tenantId, callback) {
    this.update({
        '_id': id,
        'scope': 'User',
        'tenantId': tenantId
    }, {'isActive': false}, callback);
};

User.statics.updateUserByTenantId = function(id, tenantId, user, callback) {
    if (user.createdAt) {
        delete user.createdAt;
    }
    user.updatedAt = new Date();
    this.update({
        '_id': id,
        'tenantId': tenantId
    }, user, callback);
};

User.statics.findUser = function(username, callback) {
    this.findOne({
        username: username
    }, callback);
};

User.statics.findDeactiveUserByTenantId = function(id, callback) {
    this.find({
        'tenantId': id,
        'scope': 'User',
        'isActive': false
    }, callback);
};

User.statics.findUserById = function(id, callback) {
    this.findOne({
        '_id': id
    }).populate('tenantId').exec(callback);
};

User.statics.findUserByIdTenantId = function(id, tenantId, callback) {
    this.findOne({
        '_id': id,
        'tenantId': tenantId
    }).populate('tenantId').exec(callback);
};

User.statics.findUserByTenantIdScope = function(id, scope, callback) {
    this.find({
        'tenantId': id,
        'scope': scope,
        'isActive': true
    }, callback);
};

User.statics.findAdmin = function(callback) {
    this.find({
        scope: 'Admin'
    }, callback);
};

User.statics.searchUser = function(query, callback) {
    this.find(query, callback);
};

var user = mongoose.model('User', User);

/** export schema */
module.exports = {
    User: user
};