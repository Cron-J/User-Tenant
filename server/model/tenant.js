'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    constants = require('../Utility/constants').constants,
    validator = require('mongoose-validators');

/** 
 * @module tenant
 * @description tenant class contains the details of tenant
 */

var Tenant = new Schema({

    /**
     * name must be string and required field
     */
    name: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isLength(2,30), validator.matches(constants.nameRegex)]
    },

    /**
     * description must be string
     */
    description: {
        type: String,
        trim: true,
        validate: [validator.isLength(2,30), validator.matches(constants.nameRegex)]
    },

    /**
     * User name who has created the tenant.
     */
    createdBy: {
        type: ObjectId
    },

    /**
     * User name who has updated tenant recently.
     */
    updatedBy: {
        type: ObjectId
    },

    /**
     * Tenant creation timestamp.
     */
    createdAt: {
        type: Date
    },

    /**
     * Tenant updation timestamp.
     */
    updatedAt: {
        type: Date
    },

});

Tenant.statics.saveTenant = function(requestData, callback) {
    requestData.createdAt = new Date();
    requestData.updatedAt = new Date();
    var tenant = new this(requestData);
    tenant.save(callback);
};

Tenant.statics.updateTenant = function(id, tenant, callback) {
    if( tenant.createdAt ) { delete tenant.createdAt; }
    tenant.updatedAt = new Date();
    this.update({
        '_id': id
    }, tenant, callback);
};

Tenant.statics.findTenantById = function(id, callback) {
    this.findOne({
        '_id': id
    }, callback);
};

Tenant.statics.searchTenant = function(query, callback) {
    this.find(query, callback);
};

Tenant.statics.remove = function(id, callback) {
    this.find({
        _id: id
    }).remove(callback);
};

var tenant = mongoose.model('tenant', Tenant);

module.exports = {
    Tenant: tenant
};