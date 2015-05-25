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
    { method: 'POST', path: '/user', config: User.createAdmin},
    { method: 'POST', path: '/activateUser', config: User.activateUserByTenant},
    { method: 'PUT', path: '/user/{id}', config: User.updateUser},
    { method: 'POST', path: '/searchUser', config: User.searchUser},
    { method: 'GET', path: '/exportUser', config: User.exportUser},
    { method: 'GET', path: '/user', config: User.getUser},
    { method: 'GET', path: '/user/{id}', config: User.getUserByAdmin},
    { method: 'GET', path: '/userByTenant/{id}', config: User.getUserByTenant},
    { method: 'POST', path: '/login', config: User.login},
    { method: 'POST', path: '/forgotPassword', config: User.forgotPassword},
    { method: 'POST', path: '/tenantSelfRegistration', config: Tenant.createTenantSelfRegistration}, 
    { method: 'POST', path: '/searchTenant', config: Tenant.searchTenant},
    { method: 'GET', path: '/tenant/{id}', config: Tenant.getTenant},
    { method: 'PUT', path: '/tenant/{id}', config: Tenant.updateTenantByAdmin},
    { method: 'POST', path: '/tenantUser', config: User.createUser},
    { method: 'GET', path: '/tenantUser/{id}', config: User.getAllTenantUserByTenant}
];