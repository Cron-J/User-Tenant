'use strict';

app.controller('accountCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', 'userInfo','countryList',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        userInfo, countryList) {
        var _scope = {};
        _scope.init = function() {
            $scope.loginForm = {
                remember: true
            };
            $scope.authError = null;
            //clear country selection
            $scope.clearCountrySelection();
            //country list
            if($location.path() != '/login' && $location.path() !='/forgotPassword') {
                countryList.async().then(function(response) {
                    $scope.countryList = response.data;
                    $scope.countryList1 = angular.copy($scope.countryList);
                    if($location.path() == '/editProfile') {
                        $scope.profileView = 'edit';
                        getAccountDetails();
                    }
                });
            }
            $scope.setPassword = false;
            $scope.isUser = true;
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
                    growl.addSuccessMessage('Email has been sent successfully');
                    $location.path('/login');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                })
        }

        //Tenant Self Registration
        $scope.tenantSelfRegistration = function (account_info) {

                delete account_info.passwordConfirm;
                $http.post('/tenantSelfRegistration', account_info)
                .success(function (data, status) {
                    growl.addSuccessMessage('Tenant has been successfully registered');
                    $location.path('login');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
     
        }

        //Tenant-User Self Registration
        $scope.tenantUserSelfRegistration = function (account_info) {
                delete account_info.passwordConfirm;
                $http.post('/user', account_info)
                .success(function (data, status) {
                    growl.addSuccessMessage('Tenant has been successfully registered');
                    $location.path('login');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
     
        }

        //Get Personal Account Details
        var getAccountDetails = function () {
            userInfo.async().then(function(response) {
                for (var i = 0; i < $scope.countryList.length; i++) {
                    if($scope.countryList[i].code == response.data.address.country ) {
                        response.data.address.country = [];
                        response.data.address.country[0] = {};
                        response.data.address.country[0] = $scope.countryList[i];
                        response.data.address.country[0].ticked = true;
                    }
                };
                $scope.account = response.data;
                $scope.current_usr.firstName = response.data.firstName;
                $scope.current_usr.lastName = response.data.lastName;
            });
        }

        //Update Personal Account Details
        $scope.updateProfile = function (account_info, valid) {
            if(valid){
                var dataDump = angular.copy(account_info);
                var countryDump = angular.copy(account_info.address.country);
                account_info.address.country = account_info.address.country[0].code;
                delete account_info._id, delete account_info.createdAt, 
                delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                $http.put('/user', account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Account has been updated successfully');
                    getAccountDetails();
                    $scope.profileView = 'view';
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                    account_info.address.country = dataDump.address.country;
                });
            }
        }

        $scope.resetPassword = function (isTrue) {
            if(isTrue == true)
                $scope.setPassword = false;
            else
                $scope.setPassword = true;
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

