'use strict';

// Load modules

var User      = require('./controller/user'),
	Tenant    = require('./controller/tenant'),
    Static    = require('./static'),
    Staticlist= require('./Utility/staticlist');

// API Server Endpoints
exports.endpoints = [

    { method: 'GET',  path: '/{somethingss*}', config: Static.get },
    { method: 'GET',  path: '/countryList', config: Staticlist.getCountryList },
    { method: 'POST', path: '/admin', config: User.createAdmin},
    { method: 'POST', path: '/activateUser', config: User.activateUserByTenant},
    { method: 'POST', path: '/deActivateUser', config: User.deActivateUserByTenant},

    /**
       PUT: /user
       Description: Update own info for one who is logged in i.e. Admin, Tenant Admin, Tenant User.
    */
    { method: 'PUT', path: '/user', config: User.updateUser},

    /**
        PUT: /user/{id}
        PUT: /user/{id}/{tenantId}
        @param id : user id of Tenant User whose info need to be edited.
        Description: Update Tenant User info by System Admin.
    */
    { method: 'PUT', path: '/user/{id}', config: User.updateTenantUser},

    /**
        PUT: /user/{id}
        PUT: /user/{id}/{tenantId}
        @param id : user id of Tenant User whose info need to be edited.
        @param tenantId : tenant id of tenant whose use info is to be updated.
        Description: Update Tenant User info by System Admin.
    */
    { method: 'PUT', path: '/user/{id}/{tenantId}', config: User.updateTenantUser},

    /**
        POST: /searchUser
        Description: Search User based on certain field/criteria (firstName, lastName, email, tenantId).
    */
    { method: 'POST', path: '/searchUser', config: User.searchUser},
    { method: 'GET', path: '/exportUser', config: User.exportUser},
    { method: 'GET', path: '/user', config: User.getUser},
    { method: 'GET', path: '/user/{id}', config: User.getUserByAdmin},
    { method: 'GET', path: '/userByTenant/{id}', config: User.getUserByTenant},
    { method: 'POST', path: '/login', config: User.login},
    { method: 'POST', path: '/forgotPassword', config: User.forgotPassword},
    { method: 'POST', path: '/tenantSelfRegistration', config: Tenant.createTenantSelfRegistration}, 
    { method: 'POST', path: '/searchTenant', config: Tenant.searchTenant},
    { method: 'GET', path: '/exportTenant', config: Tenant.exportTenant},
    { method: 'GET', path: '/tenant/{id}', config: Tenant.getTenant},
    { method: 'PUT', path: '/tenant/{id}', config: Tenant.updateTenantByAdmin},
    { method: 'POST', path: '/user', config: User.createUser},
    { method: 'GET', path: '/tenantUser/{id}', config: User.getAllTenantUserByTenant},
    { method: 'GET', path: '/tenantDeactiveUser/{id}', config: User.getAllDeactiveTenantUserByTenant}
];