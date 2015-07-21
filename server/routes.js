'use strict';

// Load modules

var Activity  = require('./controller/activity'),
    Role      = require('./controller/role'),
    User      = require('./controller/user'),
	Tenant    = require('./controller/tenant'),
    Auth      = require('./Utility/authorization'),
    Static    = require('./static'),
    Staticlist= require('./Utility/staticlist');

// API Server Endpoints
exports.endpoints = [
    //Get gui pages
    { method: 'GET',  path: '/{somethingss*}', config: Static.get },
    //Create Activities
    { method: 'POST',  path: '/activities', config: Activity.createActivities },
    //Get Activities
    { method: 'POST',  path: '/getactivities', config: Activity.getActivitiesList },
    //Create Roles
    { method: 'POST',  path: '/roles', config: Role.createRoles },
    //Get Roles
    { method: 'GET',  path: '/getRoles', config: Role.getRoles },
    //Create Admin
    { method: 'POST', path: '/admin', config: User.createAdmin},
    //Activate TenantUser
    { method: 'POST', path: '/activateUser', 
        config:{
            app: {
                permissionLevel: 4  // "permission level" for this route
            },
            handler:User.activateUser, 
            pre: [
                    {method:Auth.checkPermission, assign:'AU'}
                ]
        }
    },
    { method: 'POST', path: '/deActivateUser', 
        config:{
            app: {
                permissionLevel: 5  // "permission level" for this route
            },
            handler:User.deActivateUser, 
            pre: [
                    {method:Auth.checkPermission, assign:'DU'}
                ]
        }
    },
    { method: 'PUT', path: '/user', config: User.updateUser},
    { method: 'PUT', path: '/user/{id}', config: User.updateTenantUser},
    { method: 'PUT', path: '/user/{id}/{tenantId}', config: User.updateTenantUser},
    { method: 'POST', path: '/searchUser', 
        config:{
            app: {
                permissionLevel: 9  // "permission level" for this route
            },
            handler:User.searchUser, 
            pre: [
                    {method:Auth.checkPermission}
                ]
        }
    },
    { method: 'GET', path: '/exportUser', 
        config: {
            app: {
                permissionLevel: 7  // "permission level" for this route
            },
            handler:User.exportUser, 
            pre: [
                    {method:Auth.checkPermission}
                ]
        }
    },

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
    { method: 'GET', path: '/userByName/{username}', 
        config: {
            app: {
                permissionLevel: 2  // "permission level" for this route
            },
            handler:User.getUserByName, 
            pre: [
                    {method:Auth.checkPermission, assign:'UBN'}
                ]
        }
    },

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
    { method: 'POST', path: '/user', config: User.createUserSelfRegistration},
    { method: 'GET', path: '/tenantUser/{id}', config: User.getAllTenantUserByTenant},
    { method: 'GET', path: '/tenantDeactiveUser/{id}', config: User.getAllDeactiveTenantUserByTenant},
    { method: 'POST', path: '/tenantUser', config: User.createTenantUser},
    { method: 'POST', path: '/tenantCreation', config: Tenant.createTenantByAdmin},
    // { method: 'POST', path: '/tenantUserCreation', config: User.createTenantUserbyTenant},
    { method: 'POST', path: '/sendActivationEmail', config: User.sendActivationEmail},
    { method: 'POST', path: '/sendCredentials', config: User.sendCredentials},
    { method: 'POST', path: '/changePassword', config: User.changePasswordRequest},
    { method: 'POST', path: '/getSuggestions', config: User.usernameSuggestions},
    { method: 'DELETE', path: '/deleteAccount/{id}', config: User.deleteUser}

    
];