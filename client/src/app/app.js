'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('app', [
    'ngCookies',
    'angularLocalStorage',
    'ngSanitize',
    'angular-growl',
    'ui.router',
    'ngRoute',
    'ui.bootstrap',
    'angularUtils.directives.dirPagination',
    'app.factory',
    'cons'
])


.config(
  ['$stateProvider', '$urlRouterProvider', 'growlProvider', '$httpProvider', 'USER_ROLES',
    function ($stateProvider,   $urlRouterProvider,   growlProvider, $httpProvider, USER_ROLES) {       
        growlProvider.globalTimeToLive(3000);
        growlProvider.globalEnableHtml(true);
        $urlRouterProvider.otherwise("/error");   
        $stateProvider
          .state('login', {
            url: "/login",
              templateUrl: "app/views/common/login.html",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }
          })
          .state('tenantSignup', {
            url: "/signup",
              templateUrl: "app/views/tenant/create.html",
              controller: 'accountCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }
          }) 
          .state('forgotPassword', {
            url: "/forgotPassword",
              templateUrl: "app/views/common/forgot_password.html",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }

          }) 
          .state('home', {
            url: "/home",
              templateUrl: "app/views/common/home.html",
              controller: 'tenantUserCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.tenantuser]
              }

          })
          .state('error', {
            url: "/error",
              templateUrl: "app/views/common/error.html",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }

          })
          .state('createTenant', {
            url: "/tenantCreation",
              templateUrl: "app/views/tenant/create.html",
              controller: 'tenantCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.admin, , USER_ROLES.tenantadmin]
              }
          }) 
          .state('createTenantUser', {
            url: "/tenantUserCreation",
              templateUrl: "app/views/tenant_user/tenant_user.html",
              controller: 'tenantUserCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.tenantadmin]
              }

          }) 
          .state('tenants', {
            url: "/tenants",
              templateUrl: "app/views/tenant/home.html",
              controller: "adminCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin]
              }

          })
          .state('tenant', {
            url: "/tenant/:tenantId",
              templateUrl: "app/views/tenant/edit.html",
              controller: "tenantCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin]
              }

          })
          .state('tenantHome', {
            url: "/tenantHome",
              templateUrl: "app/views/tenant/tenant_users_list.html",
              controller: "tenantCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.tenantadmin]
              }

          })
          .state('tenantUser', {
            url: "/tenantUser/:tUserId",
              templateUrl: "app/views/tenant_user/tenant_user.html",
              controller: "tenantUserCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.tenantadmin]
              }

          })
          .state('users', {
            url: "/users",
              templateUrl: "app/views/tenant_user/home.html",
              controller: "adminCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin]
              }

          })
          .state('user', {
            url: "/user/:tenantUserId",
              templateUrl: "app/views/tenant_user/tenant_user.html",
              controller: "tenantUserCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.tenantadmin]
              }

          })
          .state('editProfile', {
            url: "/editProfile",
              templateUrl: "app/views/common/profile.html",
              controller: "accountCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }

          })
            
          
          $httpProvider.interceptors.push('authInterceptor');
    }
  ]
)
.run(function($rootScope, $location, AuthServ,$cookieStore) {

    $rootScope.$on('$stateChangeStart', function(event, next) {
       var authorizedRoles = next.data ? next.data.authorizedRoles : null;
       var isAuthorized = AuthServ.isAuthorized(authorizedRoles);
       if(!isAuthorized){
          event.preventDefault();
          AuthServ.isLoggedInAsync(function(loggedIn) {
            if(!loggedIn){
                  $location.path('/login');
            }
            else{
                $location.path('/error');
            }
          }) 
        }
        else if(isAuthorized){
          AuthServ.isLoggedInAsync(function(loggedIn) {
            if (!loggedIn) {      
              if($location.path() == '/signup')
                  $location.path('/signup');
               else        
                $location.path('/login');
            }
            // else if(loggedIn){
            //       $location.path('/error');
            // }
          });
        }
      });

    })

.factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
  return {
    request: function (config) {

      config.headers = config.headers || {};
      
      return config;
    },
    responseError: function(response) {
      if(($location.path() != '/login'))
          $cookieStore.put('url',$location.path())
      if(response.status === 401) {
        $location.path('/login');
        return $q.reject(response);
      }
      else {
        return $q.reject(response);
      }
    }
  };
})

angular.module('cons', [])
  .constant('USER_ROLES', {
      all: '*',
      admin: 'Admin',
      tenantadmin: 'Tenant-Admin',
      tenantuser:'Tenant-User'
  })
  