'use strict';

// Load modules

var User      = require('./controller/user'),
	Tenant    = require('./controller/tenant'),
    Static    = require('./static');

// API Server Endpoints
exports.endpoints = [

    { method: 'GET',  path: '/{somethingss*}', config: Static.get },
    { method: 'POST', path: '/user', config: User.createAdmin},
    { method: 'PUT', path: '/user', config: User.updateUser},
    { method: 'POST', path: '/searchUser', config: User.searchUser},
    { method: 'GET', path: '/exportUser', config: User.exportUser},
    { method: 'GET', path: '/user', config: User.getUser},
    { method: 'GET', path: '/user/{id}', config: User.getUserByAdmin},
    { method: 'GET', path: '/userByTenant/{id}', config: User.getUserByTenant},
    { method: 'PUT', path: '/userByAdmin/{id}', config: User.updateUserByAdmin},
    { method: 'POST', path: '/login', config: User.login},
    { method: 'POST', path: '/forgotPassword', config: User.forgotPassword},
    { method: 'POST', path: '/tenant', config: Tenant.createTenant},
    { method: 'POST', path: '/tenantSelfRegistration', config: Tenant.createTenantSelfRegistration}, 
    { method: 'POST', path: '/searchTenant', config: Tenant.searchTenant},
    { method: 'GET', path: '/tenant/{id}', config: Tenant.getTenant},
    { method: 'PUT', path: '/tenant/{id}', config: Tenant.updateTenantByAdmin},
    { method: 'POST', path: '/tenantUser', config: User.createTenantUser},
    { method: 'PUT', path: '/tenantUser/{id}', config: User.updateTenantUserByTenantAdmin},
    { method: 'GET', path: '/tenantUser/{id}', config: User.getAllTenantUserByTenant}
];