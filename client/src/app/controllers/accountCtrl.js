'use strict';

app.controller('accountCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter) {
        var _scope = {};
        _scope.init = function() {
           $scope.loginForm = {
                remember: true
            };
            $scope.user = {};
            $scope.authError = null;
        }
        
        //Tenant account creation
        $scope.createTenantAccount = function (account_info, valid) {
            if(valid){
                account_info.tenant.validFrom = $filter('date')(account_info.tenant.validFrom, "MM/dd/yyyy");
                account_info.tenant.validTo = $filter('date')(account_info.tenant.validTo, "MM/dd/yyyy");
                 $http.post('/tenant', account_info)
                .success(function (data, status) {
                    // AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Account has been created successfully');
                    $location.path('app');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }

        //Tenant-User account creation
        $scope.createTenantUserAccount = function (account_info, valid) {
            if(valid){
                account_info.tenant.validFrom = $filter('date')(account_info.tenant.validFrom, "MM/dd/yyyy");
                account_info.tenant.validTo = $filter('date')(account_info.tenant.validTo, "MM/dd/yyyy");
                 $http.post('/tenantUser', account_info)
                .success(function (data, status) {
                    // AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Account has been created successfully');
                    $location.path('app');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }

        //User login
        $scope.login = function (user) {
            $http.post('/login', user)
                .success(function (data, status) {
                    AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Successfully logged in');
                    console.log('******************', data);
                    $rootScope.user = data;
                    if(user.scope == 'Admin')
                        $location.path('/users');
                    else if(user.scope == 'Tenant-Admin')
                        $location.path('/users');
                    else 
                         $location.path('/users');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });

        }

        //User logout
        $scope.logOut = function() {
            AuthServ.clearCookie();
            AuthServ.removeUser();
            delete $rootScope.user;
            $location.path('/login');
        }

        //forgot password
        $scope.forgotPassword = function (email_add) {
            $http.post('/forgotPassword', {userId:email_add})
                .success(function (data, status) {
                    console.log(data);
                    growl.addSuccessMessage('Email has been sent');
                    $location.path('/login');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                })
        }

        //Date picker
        $scope.open1 = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened1 = true;
        };

        $scope.open2 = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened2 = true;
        };

        // $scope.dateOptions = {
        //     formatYear: 'yy',
        //     startingDay: 1
        // };

        $scope.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];

        _scope.init();
}]);

