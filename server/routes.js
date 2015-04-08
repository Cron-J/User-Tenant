'use strict';

// Load modules

var User      = require('./controller/user'),
	Tenant    = require('./controller/tenant'),
    Static    = require('./static');

// API Server Endpoints
exports.endpoints = [

    { method: 'GET',  path: '/{somethingss*}', config: Static.get },
    { method: 'POST', path: '/user', config: User.createAdmin},
    { method: 'POST', path: '/login', config: User.login},
    { method: 'POST', path: '/forgotPassword', config: User.forgotPassword},
    { method: 'POST', path: '/tenant', config: Tenant.createTenant}
];