'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp'),
    constants = require('../Utility/constants').constants,
    validator = require('mongoose-validators'),
    Address = require('./address').Address;

/** 
 * @module tenant
 * @description tenant class contains the details of tenant
 */

var Tenant = new Schema({

    /**
     * tenant id is indexed 
     */
    tenantId: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isLength(2,30), validator.matches(constants.idRegex)]
    },

    /**
     * name must be string and required field
     */
    name: {
        type: String,
        required: true,
        trim: true,
        validate: [validator.isLength(2,30), validator.matches(constants.nameRegex)]
    },

    /**
     * status must be string and required field
     */
    status: {
        type: String,
        required: true,
        trim: true,
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
     * valid from must be string and required field
     */
    validFrom: {
        type: Date,
        required: true

    },

    /**
     * valid to must be string and required field
     */
    validTo: {
        type: Date,
        required: true
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
        required: true,
        enum: ['Tenant-Admin', 'Admin']
    },

    /**
     * User name who has changed the User last time.
     */
    updatedBy: {
        type: String,
        required: true,
        enum: ['Admin', 'Tenant-Admin']
    },
});

/**
 * Date when the Tenant was created.
 * Date when the Tenant was changed last time.
 */
Tenant.plugin(timestamps);

Tenant.statics.saveTenant = function(requestData, callback) {
    var tenant = new this(requestData);
    tenant.save(callback);
};

Tenant.statics.updateTenant = function(id, tenant, callback) {
    this.update({
        '_id': id
    }, tenant, callback);
};

Tenant.statics.findTenantByDisplayId = function(tenantId, callback) {
    this.findOne({
        tenantId: tenantId
    }, callback);
};

Tenant.statics.findTenantById = function(id, callback) {
    this.findOne({
        '_id': id
    }, callback);
};

Tenant.statics.getAllTenant = function(callback) {
    this.find({}, callback);
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