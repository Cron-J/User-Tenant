'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    constants = require('../Utility/constants').constants,
    validator = require('mongoose-validators'),
    db = require('../config/db').db;

/** 
 * @module tenant
 * @description tenant class contains the details of tenant
 */

var Activity = new Schema({
    /**
     * aid must be number and required field
     */
    aId: {
        type: Number,
        required: true,
        unique: true,
    },

    /**
     * name must be string and required field
     */
    name: {
        type: String,
        required: true,
        unique: true
    }
});

Activity.statics.saveActivity = function(requestData, callback) {
    this.create(requestData, callback);
};

Activity.statics.findActivities = function(array, callback) {
        this.find({
            'id': { $in: array}
        }, callback);
};

Activity.statics.findActivityById = function(id, callback) {
        this.findOne({
             "id": id
        }, callback);
};

Activity.statics.getActivityList = function(query, callback) {
    this.find(query, callback);
};

var activity = mongoose.model('Activity', Activity);

module.exports = {
    Activity: activity
};