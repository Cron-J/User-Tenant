'use strict';

// Load modules

var Role      = require('./controller/role'),
    User      = require('./controller/user'),
	Tenant    = require('./controller/tenant'),
    Static    = require('./static'),
    Staticlist= require('./Utility/staticlist');

// API Server Endpoints
exports.endpoints = [

    { method: 'GET',  path: '/{somethingss*}', config: Static.get },
    { method: 'POST',  path: '/roles', config: Role.createRoles },
    { method: 'GET',  path: '/getRoles', config: Role.getRoles },
    { method: 'POST', path: '/admin', config: User.createAdmin},

    /**
       POST: /activateUser
       SCOPE: 'Admin', 'Tenant-Admin'
       Description: Activate tenant User.
    */
    { method: 'POST', path: '/activateUser', config: User.activateTenantUser},

    /**
       POST: /deActivateUser
       SCOPE: 'Admin', 'Tenant-Admin'
       Description: deActivate tenant User.
    */
    { method: 'POST', path: '/deActivateUser', config: User.deActivateTenantUser},

    /**
       PUT: /user
       SCOPE: 'Admin', 'Tenant-Admin', 'User'
       Description: Update own info for one who is logged in i.e. Admin, Tenant Admin, Tenant User.
    */
    { method: 'PUT', path: '/user', config: User.updateUser},

    /**
        PUT: /user/{id}
        SCOPE: 'Tenant-Admin'
        @param id : user id of Tenant User whose info need to be edited.
        Description: Update Tenant User info by System Admin.
    */
    { method: 'PUT', path: '/user/{id}', config: User.updateTenantUser},

    /**
        PUT: /user/{id}/{tenantId}
        SCOPE: 'Admin'
        @param id : user id of Tenant User whose info need to be edited.
        @param tenantId : tenant id of tenant whose use info is to be updated.
        Description: Update Tenant User info by System Admin.
    */
    { method: 'PUT', path: '/user/{id}/{tenantId}', config: User.updateTenantUser},

    /**
        POST: /searchUser
        SCOPE: 'Admin'
        Description: Search User based on certain field/criteria (firstName, lastName, email, tenantId).
    */
    { method: 'POST', path: '/searchUser', config: User.searchUser},
    { method: 'GET', path: '/exportUser', config: User.exportUser},

    /**
        GET: /user
        Description: Get User own information.
    */
    { method: 'GET', path: '/user', config: User.getUser},

    /**
        GET: /user/{id}
        @param id : user id of Tenant User whose info is to be get
        Description: Get Tenant User information.
    */
    { method: 'GET', path: '/user/{id}', config: User.getUserByAdmin},

    /**
        GET: /user/{id}
        @param id : user id of Tenant User whose info is to be get
        Description: Get Tenant User information.
    */
    { method: 'GET', path: '/userByName/{username}', config: User.getUserByName},

    /**
        GET: /user/{id}
        @param id : user id of Tenant User whose info is to be get
        Description: Get Tenant User information.
    */
    { method: 'GET', path: '/userByTenant/{id}', config: User.getUserByTenant},

    /**
        POST: /login
        SCOPE: Open for all
        Description: Login user.
    */
    { method: 'POST', path: '/login', config: User.login},

    /**
        POST: /forgotPassword
        SCOPE: Open for all
        Description: Email will be send to user email.
    */
    { method: 'POST', path: '/forgotPassword', config: User.forgotPassword},
    { method: 'PUT', path: '/emailVerification', config: User.emailVerification},
    { method: 'POST', path: '/resendVerificationMail', config: User.resendVerificationMail},
    { method: 'POST', path: '/tenantSelfRegistration', config: Tenant.createTenantSelfRegistration}, 
    { method: 'POST', path: '/searchTenant', config: Tenant.searchTenant},
    { method: 'GET', path: '/exportTenant', config: Tenant.exportTenant},
    { method: 'GET', path: '/tenant/{name}', config: Tenant.getTenant},
    { method: 'PUT', path: '/tenant/{id}', config: Tenant.updateTenantByAdmin},
    { method: 'POST', path: '/user', config: User.createUser},
    { method: 'GET', path: '/tenantUser/{id}', config: User.getAllTenantUserByTenant},
    { method: 'GET', path: '/tenantDeactiveUser/{id}', config: User.getAllDeactiveTenantUserByTenant},
    { method: 'POST', path: '/tenantUser', config: User.createTenantUser},
    { method: 'POST', path: '/tenantCreation', config: Tenant.createTenantByAdmin},
    { method: 'POST', path: '/tenantUserCreation', config: User.createTenantUserbyTenant},
    { method: 'POST', path: '/sendActivationEmail', config: User.sendActivationEmail},
    { method: 'POST', path: '/sendCredentials', config: User.sendCredentials},
    { method: 'POST', path: '/changePassword', config: User.changePasswordRequest},
    { method: 'POST', path: '/getSuggestions', config: User.usernameSuggestions},
    { method: 'DELETE', path: '/deleteAccount/{id}', config: User.deleteUser}

    
];