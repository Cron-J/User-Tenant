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
    { method: 'PUT', path: '/userByAdmin/{id}', config: User.updateUserByAdmin},
    { method: 'POST', path: '/login', config: User.login},
    { method: 'POST', path: '/forgotPassword', config: User.forgotPassword},
    { method: 'POST', path: '/tenant', config: Tenant.createTenant},
    { method: 'GET', path: '/tenant', config: Tenant.getAllTenants},
    { method: 'POST', path: '/tenantUser', config: User.createTenantUser}
];