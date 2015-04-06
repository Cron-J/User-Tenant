'use strict';

/**
 * @class Address
 * @classdesc address class contains the address details
 */
var address = {

    /** 
      Unit. It can only contain string.
    */

    unit: {
        type: String
    },

    /** 
      Building. It can only contain string.
    */

    building: {
        type: String
    },

    /** 
      Street. It can only contain string.
    */

    street: {
        type: String
    },

    /** 
      City. It can only contain string.
    */

    city: {
        type: String
    },

    /** 
      Region. It can only contain string.
    */

    region: {
        type: String
    },

    /** 
      Country. It can only contain string.
    */

    country: {
        type: String
    },

    /** 
      Address Code Or Postal Code. It can only contain string.
    */

    addressCode: {
        type: String
    }
};


module.exports = {
    Address: address
};