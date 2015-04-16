'use strict';

app.controller('accountCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', 'userInfo','$cookieStore',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, userInfo,$cookieStore) {
        var _scope = {};
        _scope.init = function() {
            $scope.loginForm = {
                remember: true
            };
            $scope.authError = null;
            if($location.path() == '/editProfile') {
                $scope.profileView = 'view';
                userInfo.async().then(function(response) {
                    $scope.current_usr = response.data;
                });
            }
            console.log('***data***', $scope.current_usr);
        }

        //User login
        $scope.login = function (user) {
            $http.post('/login', user)
                .success(function (data, status) {
                    AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Successfully logged in');
                    $rootScope.user =  data;
                    if($rootScope.user.scope == 'Admin')
                        $location.path('/tenants');
                    else if($rootScope.user.scope == 'Tenant-Admin')
                        $location.path('/tenantHome');
                    else if($rootScope.user.scope == 'Tenant-User')
                         $location.path('/home');
                    // getAccountInfo();
                    // userInfo.async().then(function(response) {
                    // $scope.current_usr = response.data;
                    //   console.log('***data***', $scope.current_user);
                    // });
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

        //Tenant Self Registration
        $scope.tenantSelfRegistration = function (account_info, valid) {
            if(valid){
                account_info.tenant.validFrom = $filter('date')(account_info.tenant.validFrom, "MM/dd/yyyy");
                account_info.tenant.validTo = $filter('date')(account_info.tenant.validTo, "MM/dd/yyyy");
                $http.post('/tenantSelfRegistration', account_info)
                .success(function (data, status) {
                    growl.addSuccessMessage('Tenant has been successfully registered');
                    $location.path('login');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }

        //Update Personal Account Details
        $scope.updateProfile = function (account_info, valid) {
            if(valid){
                delete account_info._id, 
                $http.put('/user', account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Account has been updated successfully');
                    $scope.profileView = 'view';
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
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

