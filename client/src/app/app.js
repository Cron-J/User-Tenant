'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('app', [
    'ngCookies',
    'ngSanitize',
    'angular-growl',
    'ui.router',
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
        $urlRouterProvider.otherwise("/login")
        $stateProvider
          .state('login', {
            url: "/login",
              templateUrl: "app/views/account/login.html",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }
          })
          .state('signup', {
            url: "/signup",
              templateUrl: "app/views/account/signup.html"

          }) 
          .state('forgotPassword', {
            url: "/forgotPassword",
              templateUrl: "app/views/account/forgot_password.html",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }

          }) 
          .state('home', {
            url: "/home",
              templateUrl: "app/views/home.html",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }

          })
          .state('error', {
            url: "/error",
              templateUrl: "app/views/error.html",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }

          }) 
            
          
            $httpProvider.interceptors.push('authInterceptor');
    }
  ]
)

.run(['$rootScope', '$state', 'AuthServ', '$location', 
  '$cookieStore',
    function ($rootScope, $state, AuthServ, $location, $cookieStore) {
        AuthServ.loadFromCookie();
        $rootScope.isLoggedIn = function () {
            return !!AuthServ.getUser();
        };      
        $rootScope.$on('$stateChangeStart', function(event, next) {
        var authorizedRoles = next.data ? next.data.authorizedRoles : null;
        if (!AuthServ.isAuthorized(authorizedRoles)) {
            if (AuthServ.isLoggedInAsync()) {
                $location.path('/error');
            } else {
                $location.path('/login');
                // $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            }
        } else if (AuthServ.isAuthorized(authorizedRoles)) {
            if (!AuthServ.isLoggedInAsync()) {
                if (next.name == 'forgot_password') {
                    $state.go('forgot_password');
                }
                //$location.url('/admin-login');
                else {
                    $location.path('/login',null, {notify:false});
                   
                }

            } else if ($location.path() == '/error') {
                $location.path('/error');
            } else {
                if ($location.path() != '/app') {

                } else {
                    var url = '/app';
                    $location.path(url);
                }

            }
        }
    });
    }
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

angular.module('cons', [])
  .constant('USER_ROLES', {
      all: '*',
      admin: 'Admin',
      tenant: 'Tenant',
      tenantuser:'TenantUser'
  })
