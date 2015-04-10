'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('app', [
    'ngCookies',
    'ngStorage',
    'ngSanitize',
    'angular-growl',
    'ui.router',
    'ui.bootstrap',
    'angularUtils.directives.dirPagination',
    'app.factory',
    'cons'
])

.factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
  return {
    request: function (config) {

      config.headers = config.headers || {};
      
      return config;
    },
    responseError: function(response) {
      if(($location.path() != '/login') || ($location.path() != '/signup'))
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
.config(
  ['$stateProvider', '$urlRouterProvider', 'growlProvider', '$httpProvider', 'USER_ROLES',
    function ($stateProvider,   $urlRouterProvider,   growlProvider, $httpProvider, USER_ROLES) {
        
        growlProvider.globalTimeToLive(3000);
        growlProvider.globalEnableHtml(true);
        $urlRouterProvider.otherwise("/login")
        // $stateProvider
        // .state('root',{
        //   url: '',
        //   views: {
        //     'header': {
        //       templateUrl: 'app/views/common/header.html'
        //     }
        //   }
        // })
        // .state('root.login', {
        //   url: '/login',
        //   views: {
        //     'container@': {
        //       templateUrl: 'app/views/common/login.html'
        //     }
        //   }
        // });    
        $stateProvider
          .state('login', {
            url: "/login",
              templateUrl: "app/views/common/login.html",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }
          })
          .state('createTenant', {
            url: "/tenantSignup",
              templateUrl: "app/views/tenant/signup.html",
              controller: 'tenantCtrl'

          }) 
          .state('createTenantUser', {
            url: "/tenantUserSignup",
              templateUrl: "app/views/tenant_user/signup.html",
              controller: 'tenantUserCtrl'

          }) 
          .state('forgotPassword', {
            url: "/forgotPassword",
              templateUrl: "app/views/common/forgot_password.html",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }

          }) 
          // .state('home', {
          //   url: "/home",
          //     templateUrl: "app/views/home.html",
          //     data: {
          //         authorizedRoles: [USER_ROLES.all]
          //     }

          // })
          .state('error', {
            url: "/error",
              templateUrl: "app/views/common/error.html",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }

          })
          .state('adminHome', {
            url: "/users",
              templateUrl: "app/views/admin/home.html",
              controller: "adminCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin]
              }

          })
            
          
            $httpProvider.interceptors.push('authInterceptor');
    }
  ]
)
.run(function($rootScope, $location, AuthServ,$cookieStore) {
    $rootScope.$on('$stateChangeStart', function(event, next) {
       var authorizedRoles = next.data ? next.data.authorizedRoles : null;
       if(!AuthServ.isAuthorized(authorizedRoles)){
          //event.preventDefault();
          AuthServ.isLoggedInAsync(function(loggedIn) {
             
            if(!loggedIn){
               $location.path('/login');
              //$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            }
            else{
             $location.path('/error');
             //$rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            }
          }) 
        }
        else if(AuthServ.isAuthorized(authorizedRoles)){
          AuthServ.isLoggedInAsync(function(loggedIn) {
            if (!loggedIn) {              
                $location.path('/login');
            }
            // else if(loggedIn){
            //     if($scope.user.scope == 'Admin')
            //       $location.path('/users');
            // }
          });
        }
      });
    })



angular.module('cons', [])
  .constant('USER_ROLES', {
      all: '*',
      admin: 'Admin',
      tenantadmin: 'Tenant-Admin',
      tenantuser:'Tenant-User'
  })
