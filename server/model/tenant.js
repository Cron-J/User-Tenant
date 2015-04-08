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


var tenantSchema = new Schema({
    /**
     * tenant id is indexed 
     */
    tenantId: {
        type: Schema.Types.ObjectId,
        index: true
    },

    /**
     * name must be string and required field
     */
    name: {
        type: String,
        required: true,
        trim: true
    },

    /**
     * status must be string and required field
     */
    status: {
        type: String,
        required: true,
        trim: true
    },

    /**
     * description must be string
     */
    description: {
        type: String,
        trim: true
    },

    /**
     * valid from must be string and required field
     */
    validFrom: {
        type: String,
        required: true,
        trim: true
    },

    /**
     * valid to must be string and required field
     */
    validTo: {
        type: String,
        required: true,
        trim: true
    }

    /** 
      Address. It stores address information.
    */
    address: Address,

    /**
     * User name who has created the User.
     */
    createdBy: {
        type: String,
        enum: ['Self', 'Admin']
    },

    /**
     * User name who has changed the User last time.
     */
    updatedBy: {
        type: String,
        enum: ['Self', 'Admin', 'Tenant-Admin']
    },
});

/**
 * Date when the Tenant was created.
 * Date when the Tenant was changed last time.
 */
Tenant.plugin(timestamps);

var tenant = Mongoose.model('tenant', tenantSchema);

module.exports = {
    Tenant: tenant
};