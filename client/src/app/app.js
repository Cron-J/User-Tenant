'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('app', [
    'ngCookies',
    'angularLocalStorage',
    'ngSanitize',
    'angular-growl',
    'ui.router',
    'ct.ui.router.extras',
    'LocalStorageModule',
    'ngRoute',
    'ui.bootstrap',
    'angularUtils.directives.dirPagination',
    'multi-select',
    'angularjs-dropdown-multiselect',
    'validation.match',
    'app.factory',
    'cons'
])

.config(
  ['$stateProvider', '$urlRouterProvider', 'growlProvider', '$httpProvider', 'USER_ACTIVITIES',
    function ($stateProvider, $urlRouterProvider, growlProvider, $httpProvider, USER_ACTIVITIES) {       
        growlProvider.globalTimeToLive(3000);
        growlProvider.globalEnableHtml(true);
        $urlRouterProvider.otherwise("/error");   
        $stateProvider
          .state('login', {
            url: "/login",
              templateUrl: "app/views/common/login.html",
              controller: 'accountCtrl',
              data: {
                  authorized: [USER_ACTIVITIES.common]
              }
          })
          .state('signup', {
            url: "/signup/:page",
              templateUrl: "app/views/common/registration.html",
              controller: 'accountCtrl',
              data: {
                  authorized: [USER_ACTIVITIES.common]
              }
          }) 
          .state('forgotPassword', {
            url: "/forgotPassword",
              templateUrl: "app/views/common/forgot_password.html",
              controller: 'accountCtrl',
              data: {
                  authorized: [USER_ACTIVITIES.common]
              }
          }) 
          .state('error', {
            url: "/error",
              templateUrl: "app/views/common/error.html",
              data: {
                  authorized: [USER_ACTIVITIES.loggedIn]
              }
          })
          .state('editProfile', {
            url: "/editProfile",
              templateUrl: "app/views/common/profile.html",
              controller: "accountCtrl",
              data: {
                  authorized: [USER_ACTIVITIES.loggedIn]
              }
          })
          .state('createTenant', {
            url: "/newTenant",
              templateUrl: "app/views/tenant/tenant.html",
              controller: 'tenantCtrl',
              data: {
                  authorized: [8]
              }
          }) 
          .state('createUser', {
            url: "/newUser",
              templateUrl: "app/views/tenant_user/tenantUser.html",
              controller: 'tenantUserCtrl',
              data: {
                  authorized: [0]
              }
          }) 
          .state('tenants', {
            url: "/tenants",
              templateUrl: "app/views/tenant/tenantSearchPage.html",
              controller: "tenantCtrl",
              data: {
                  authorized: [9]
              }

          })
          .state('tenantInfo', {
            url: "/tenants/:tname",
              templateUrl: "app/views/tenant/tenant.html",
              controller: "tenantCtrl",
              data: {
                  authorized: [10]
              }
          })
          .state('usersOfTenant', {
            url: "/:tenantName/users",
              templateUrl: "app/views/tenant_user/userSearchPage.html",
              controller: "tenantUserCtrl",
              data: {
                  authorized: [13]
              }
          })
          .state('userOfTenant', {
            url: "/:tenant/users/:selectedId",
              templateUrl: "app/views/tenant_user/tenantUser.html",
              controller: "tenantUserCtrl",
              data: {
                  authorized: [14]
              }
          })
          .state('users', {
            url: "/users",
              templateUrl: "app/views/tenant_user/userSearchPage.html",
              controller: "tenantUserCtrl",
              data: {
                  authorized: [1]
              }
            })
          .state('userEdit', {
            url: "/users/:uname",
              templateUrl: "app/views/tenant_user/tenantUser.html",
              controller: "tenantUserCtrl",
              data: {
                  authorized: [2]
              }
          })
          
          .state('user', {
            url: "/user/:tenantUserId",
              templateUrl: "app/views/tenant_user/tenant_user.html",
              controller: "tenantUserCtrl",
              data: {
                  authorized: [USER_ACTIVITIES.permission]
              }

          })
          .state('inActiveUsers', {
            url: "/addUser",
              templateUrl: "app/views/tenant/tenant_users_list.html",
              controller: "tenantCtrl",
              data: {
                  authorized: [USER_ACTIVITIES.permission]
              }
          })
          .state('tenantHome', {
            url: "/tenantHome",
              templateUrl: "app/views/tenant/tenant_users_list.html",
              controller: "tenantCtrl",
              data: {
                  authorized: [USER_ACTIVITIES.permission]
              }
          })
          .state('tenantUser', {
            url: "/tenantUser/:tUserId",
              templateUrl: "app/views/tenant_user/tenantUser.html",
              controller: "tenantUserCtrl",
              data: {
                  authorized: [USER_ACTIVITIES.permission]
              }
          })
          .state('home', {
            url: "/home",
              templateUrl: "app/views/common/home.html",
              controller: 'accountCtrl',
              data: {
                  authorized: [USER_ACTIVITIES.loggedIn]
              }
          })
          .state('activateUser', {
            url: "/userActivation?userId&tId",
              // templateUrl: "app/views/tenant_user/userHome.html",
              controller: 'tenantUserCtrl',
              data: {
                  authorized: [4]
              }
          })
          .state('mailVerification', {
            url: "/verifyMail/:username/:token",
              templateUrl: "app/views/common/emailVerification.html",
              controller: 'accountCtrl',
              data: {
                  authorized: [USER_ACTIVITIES.common]
              }
          })
          .state('changePassword', {
            url: "/changePassword",
              templateUrl: "app/views/common/change_password.html",
              controller: 'accountCtrl',
              data: {
                  authorized: [USER_ACTIVITIES.loggedIn]
              }
          })
          .state('tremsAndConditions', {
            url: "/terms-and-conditions",
              templateUrl: "app/views/common/terms_and_conditions.html",
              data: {
                  authorized: [USER_ACTIVITIES.common]
              }
          })


          $httpProvider.interceptors.push('authInterceptor');

           // $stickyStateProvider.enableDebug(true);
    }
  ]
)
.run(function($rootScope, $location, AuthServ,$cookieStore, $timeout, $stateParams) {
  $rootScope.$on('$stateChangeStart', function(event, next) {
     var authorized = next.data ? next.data.authorized : null;
     var isAuthorized = AuthServ.isAuthorized(authorized);
     if(!isAuthorized){
        event.preventDefault();
        AuthServ.isLoggedInAsync(function(loggedIn) {
          if(!loggedIn){
            $timeout(function () {
                $location.path('/login');
            }, 1000);
          }
          else{
            $timeout(function () {
              $location.path('/error');
            }, 1000);
          }
        }) 
      }
      else if(isAuthorized){
        AuthServ.isLoggedInAsync(function(loggedIn) {
                      
          if (!loggedIn) {      
            if($location.path() == '/tenantSignup') {
                $location.path('/tenantSignup');
            }
            else if($location.path() == '/userSignup') {
                $location.path() == '/userSignup'
            }
            else if($location.path() == '/forgotPassword') {
                $location.path() == '/forgotPassword'
            }
            else if($location.path() == '/error') {
              $timeout(function () {
                $location.path('/login');
              }, 30);
            }
            else if($location.path() == '/userActivation') {
              $location.path('/login');
            } 
            else if($stateParams) {
                var params = angular.copy($stateParams);
                if(params.username)
                  console.log('your email is verifying............');
            } 
            else {
              $location.path('/login');
            }  
          }
          else if(loggedIn){                  
            if($location.path() == '/userActivation') {
              $location.path('/users');
            }
          }
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
  .constant('USER_ACTIVITIES', {
      common: '*',
      loggedIn: '#',
      permission: [0, 1 , 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  })
 
  