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
    //Activate User
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
    //Deactivate User
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
    //Update User
    { method: 'PUT', path: '/user', config: User.updateAccount},
    { method: 'PUT', path: '/user/{id}', 
        config:{
            app: {
                permissionLevel: 3  // "permission level" for this route
            },
            handler:User.updateUser, 
            pre: [
                    {method:Auth.checkPermission, assign:'UU'}
                ]
        }
    },
    { method: 'PUT', path: '/user/{id}/{tenantId}', 
        config:{
            app: {
                permissionLevel: 3  // "permission level" for this route
            },
            handler:User.updateUser, 
            pre: [
                    {method:Auth.checkPermission, assign:'UU'}
                ]
        }
    },
    { method: 'POST', path: '/searchUser', 
        config:{
            app: {
                permissionLevel: 1  // "permission level" for this route
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
    //Search Tenant
    { method: 'POST', path: '/searchTenant', 
        config: {
            app: {
                permissionLevel: 9  // "permission level" for this route
            },
            handler:Tenant.searchTenant, 
            pre: [
                    {method:Auth.checkPermission, assign:'ST'}
                ]
        }
    },
    { method: 'GET', path: '/exportTenant', 
        config: {
            app: {
                permissionLevel: 15  // "permission level" for this route
            },
            handler:Tenant.exportTenant, 
            pre: [
                    {method:Auth.checkPermission, assign:'ET'}
                ]
        }
    },
    //Get Tenant Details
    { method: 'GET', path: '/tenant/{name}', 
        config: {
            app: {
                permissionLevel: 10  // "permission level" for this route
            },
            handler:Tenant.getTenant, 
            pre: [
                    {method:Auth.checkPermission, assign:'GT'}
                ]
        }
    },
    //Update tenant account information
    { method: 'PUT', path: '/tenant/{id}', 
        config: {
            app: {
                permissionLevel: 10  // "permission level" for this route
            },
            handler:Tenant.updateTenant, 
            pre: [
                    {method:Auth.checkPermission, assign:'UT'}
                ]
        }
    },
    { method: 'POST', path: '/user', config: User.createUserSelfRegistration},
    //Get all tenantUsers of tenant
    { method: 'GET', path: '/tenantUser/{id}', 
        config: {
            app: {
                permissionLevel: 14  // "permission level" for this route
            },
            handler:User.getAllTenantUsersOfTenant, 
            pre: [
                    {method:Auth.checkPermission, assign:'GTU'}
                ]
        }
    },
    { method: 'GET', path: '/tenantDeactiveUser/{id}', config: User.getAllDeactiveTenantUserByTenant},
    //Create User
    { method: 'POST', path: '/createUser', 
        config: {
            app: {
                permissionLevel: 0  // "permission level" for this route
            },
            handler:User.createUser, 
            pre: [
                    {method:Auth.checkPermission, assign:'CU'}
                ]
        }
    },
    //Create Tenant Account
    { method: 'POST', path: '/tenantCreation', 
        config: {
            app: {
                permissionLevel: 8  // "permission level" for this route
            },
            handler:Tenant.createTenant, 
            pre: [
                    {method:Auth.checkPermission, assign:'CU'}
                ]
        }
    },
    // { method: 'POST', path: '/tenantUserCreation', config: User.createTenantUserbyTenant},
    { method: 'POST', path: '/sendActivationEmail', config: User.sendActivationEmail},
    { method: 'POST', path: '/sendCredentials', config: User.sendCredentials},
    { method: 'POST', path: '/changePassword', config: User.changePasswordRequest},
    { method: 'POST', path: '/getSuggestions', config: User.usernameSuggestions},
    //Delete User
    { method: 'DELETE', path: '/deleteAccount/{id}', 
        config: {
            app: {
                permissionLevel: 6  // "permission level" for this route
            },
            handler:User.deleteUser, 
            pre: [
                    {method:Auth.checkPermission, assign:'DU'}
                ]
        }
    },
    { method: 'DELETE', path: '/deleteAccount/{id}/{tenantId}', 
        config: {
            app: {
                permissionLevel: 6  // "permission level" for this route
            },
            handler:User.deleteUser, 
            pre: [
                    {method:Auth.checkPermission, assign:'DU'}
                ]
        }
    }

    
];