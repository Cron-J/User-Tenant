var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp');

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
        required: true
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
        enum: ['Customer'],
        required: true
    },

    /** 
      firstName. It can only contain string.
    */
    firstName: {
        type: String,
        required: true
    },

    /** 
      lastName. It can only contain string.
    */
    lastName: {
        type: String,
        required: true
    },

    /**
     * User name who has created the User.
     */
    createdBy: {
        type: String
    },

    /**
     * User name who has changed the User last time.
     */
    updatedBy: {
        type: String
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

User.statics.updateUser = function(user, callback) {
    user.save(callback);
};

User.statics.findUser = function(userName, callback) {
    this.findOne({
        userName: userName
    }, callback);
};

User.statics.findUserByIdAndUserName = function(id, userName, callback) {
    this.findOne({
        userName: userName,
        _id: id
    }, callback);
};

var user = mongoose.model('user', User);

/** export schema */
module.exports = {
    User: user
};