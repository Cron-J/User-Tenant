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
  ['$stateProvider', '$urlRouterProvider', 'growlProvider', '$httpProvider', 'USER_ROLES',
    function ($stateProvider, $urlRouterProvider, growlProvider, $httpProvider, USER_ROLES) {       
        growlProvider.globalTimeToLive(3000);
        growlProvider.globalEnableHtml(true);
        $urlRouterProvider.otherwise("/error");   
        $stateProvider
          .state('login', {
            url: "/login",
              templateUrl: "app/views/common/login.html",
              controller: 'accountCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }
          })
          .state('tenantSignup', {
            url: "/tenantSignup",
              templateUrl: "app/views/registration/tenant_self_registration.html",
              controller: 'accountCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }
          }) 
          .state('tenantUserSignup', {
            url: "/userSignup",
              templateUrl: "app/views/registration/user_self_registration.html",
              controller: 'accountCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }
          }) 
          .state('forgotPassword', {
            url: "/forgotPassword",
              templateUrl: "app/views/common/forgot_password.html",
              controller: 'accountCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }
          }) 
          .state('error', {
            url: "/error",
              templateUrl: "app/views/common/error.html",
              data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.tenantadmin, USER_ROLES.tenantuser]
              }
          })
          .state('editProfile', {
            url: "/editProfile",
              templateUrl: "app/views/common/profile.html",
              controller: "accountCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.tenantadmin, USER_ROLES.tenantuser]
              }
          })
          .state('createTenant', {
            url: "/newTenant",
              templateUrl: "app/views/tenant/tenant.html",
              controller: 'tenantCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.admin]
              }
          }) 
          .state('createUser', {
            url: "/newUser",
              templateUrl: "app/views/tenant_user/tenantUser.html",
              controller: 'tenantUserCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.tenantadmin]
              }
          }) 
          .state('tenants', {
            url: "/tenants",
              templateUrl: "app/views/tenant/tenantSearchPage.html",
              controller: "tenantCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin]
              }

          })
          .state('tenantInfo', {
            url: "/tenants/:tname",
              templateUrl: "app/views/tenant/tenant.html",
              controller: "tenantCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin]
              }
          })
          .state('usersOfTenant', {
            url: "/:tenantName/users",
              templateUrl: "app/views/tenant_user/userSearchPage.html",
              controller: "tenantUserCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin]
              }
          })
          .state('userOfTenant', {
            url: "/:tenant/users/:selectedId",
              templateUrl: "app/views/tenant_user/tenantUser.html",
              controller: "tenantUserCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin]
              }
          })
          .state('users', {
            url: "/users",
              templateUrl: "app/views/tenant_user/userSearchPage.html",
              controller: "tenantUserCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.tenantadmin]
              }
            })
          .state('userEdit', {
            url: "/users/:uname",
              templateUrl: "app/views/tenant_user/tenantUser.html",
              controller: "tenantUserCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.tenantadmin]
              }
          })
          
          .state('user', {
            url: "/user/:tenantUserId",
              templateUrl: "app/views/tenant_user/tenant_user.html",
              controller: "tenantUserCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.admin]
              }

          })
          .state('inActiveUsers', {
            url: "/addUser",
              templateUrl: "app/views/tenant/tenant_users_list.html",
              controller: "tenantCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.tenantadmin]
              }
          })
          .state('tenantHome', {
            url: "/tenantHome",
              templateUrl: "app/views/tenant/tenant_users_list.html",
              controller: "tenantCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.tenantadmin]
              }
          })
          .state('tenantUser', {
            url: "/tenantUser/:tUserId",
              templateUrl: "app/views/tenant_user/tenantUser.html",
              controller: "tenantUserCtrl",
              data: {
                  authorizedRoles: [USER_ROLES.tenantadmin]
              }
          })
          .state('home', {
            url: "/home",
              templateUrl: "app/views/common/home.html",
              controller: 'accountCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.tenantadmin, USER_ROLES.tenantuser]
              }
          })
          .state('activateUser', {
            url: "/userActivation?userId&tId",
              // templateUrl: "app/views/tenant_user/userHome.html",
              controller: 'tenantUserCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.tenantadmin]
              }
          })
          .state('mailVerification', {
            url: "/verifyMail/:username/:token",
              templateUrl: "app/views/common/emailVerification.html",
              controller: 'accountCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }
          })
          .state('changePassword', {
            url: "/changePassword",
              templateUrl: "app/views/common/change_password.html",
              controller: 'accountCtrl',
              data: {
                  authorizedRoles: [USER_ROLES.admin, USER_ROLES.tenantadmin, USER_ROLES.tenantuser]
              }
          })
          .state('tremsAndConditions', {
            url: "/terms-and-conditions",
              templateUrl: "app/views/common/terms_and_conditions.html",
              data: {
                  authorizedRoles: [USER_ROLES.all]
              }
          })


          $httpProvider.interceptors.push('authInterceptor');

           // $stickyStateProvider.enableDebug(true);
    }
  ]
)
.run(function($rootScope, $location, AuthServ,$cookieStore, $timeout, $stateParams) {
  $rootScope.$on('$stateChangeStart', function(event, next) {
     var authorizedRoles = next.data ? next.data.authorizedRoles : null;
     var isAuthorized = AuthServ.isAuthorized(authorizedRoles);
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
  .constant('USER_ROLES', {
      all: '*',
      admin: 'Admin',
      tenantadmin: 'Tenant-Admin',
      tenantuser:'User'
  })
  