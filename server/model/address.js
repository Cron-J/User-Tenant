'use strict';

var validator = require('mongoose-validators');

/**
 * @class Address
 * @classdesc address class contains the address details
 */
var address = {

    /** 
      Unit. It can only contain string.
    */
    unit: {
        type: String,
        validate:[validator.isLength(1, 20)]
    },

    /** 
      Building. It can only contain string.
    */
    building: {
        type: String,
        validate:[validator.isLength(1, 20)]
    },

    /** 
      Street. It can only contain string.
    */
    street: {
        type: String,
        validate:[validator.isLength(1, 20)]
    },

    /** 
      City. It can only contain string.
    */
    city: {
        type: String,
        required:true, 
        validate:[validator.isLength(1, 20)]
    },

    /** 
      Region. It can only contain string.
    */
    region: {
        type: String,
        validate:[validator.isLength(1, 20)]
    },

    /** 
      Country. It can only contain string.
    */
    country: {
        type: String,
        required:true, 
        validate:[validator.isLength(1, 50)]
    },

    /** 
      Address Code Or Postal Code. It can only contain string.
    */
    addressCode: {
        type: String,
        required:true,
        validate:[validator.isAlphanumeric(), validator.isLength(3, 10)]
    }
};


module.exports = {
    Address: address
};