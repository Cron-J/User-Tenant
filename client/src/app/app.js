'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('app', [
    'ngCookies',
    'ngSanitize',
    'angular-growl',
    'ngStorage',
    'ui.router',
    'ui.bootstrap',
    'angularUtils.directives.dirPagination',
    'app.factory'
])

.run(['$rootScope', '$state', 'AuthServ',
    function ($rootScope, $state, AuthServ) {
        AuthServ.loadFromCookie();
        $rootScope.isLoggedIn = function () {
            return !!AuthServ.getUser();
        };      
    }
])


.config(
  ['$stateProvider', '$urlRouterProvider', 'growlProvider', '$httpProvider',
    function ($stateProvider,   $urlRouterProvider,   growlProvider, $httpProvider) {
        
        growlProvider.globalTimeToLive(3000);
        growlProvider.globalEnableHtml(true);
        $urlRouterProvider.otherwise("/login")
        $stateProvider
          .state('login', {
            url: "/login",
              templateUrl: "app/views/account/login.html"
          })
          .state('signup', {
            url: "/signup",
              templateUrl: "app/views/account/signup.html"

          }) 
          .state('forgotPassword', {
            url: "/forgotPassword",
              templateUrl: "app/views/account/forgot_password.html"

          }) 
          .state('home', {
            url: "/home",
              templateUrl: "app/views/home.html"

          }) 
            
          
            $httpProvider.interceptors.push('authInterceptor');
    }
  ]
)

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


