'use strict';

app.controller('accountCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', 'userInfo','countryList', '$modal', '$log', 
    '$stateParams', '$timeout',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        userInfo, countryList, $modal, $log, $stateParams, $timeout) {
        var _scope = {};
        _scope.init = function() {
            $scope.loginForm = {
                remember: true
            };
            $scope.authError = null;
            if($location.path() == '/home' || $location.path() == '/changePassword') {
                userInfo.async().then(function(response) {
                    $scope.current_usr.firstName = response.data.firstName;
                    $scope.current_usr.lastName = response.data.lastName;
                    if(response.data.tenantId)
                        $scope.current_usr.tenantName = response.data.tenantId.name;
                });
            }
            
            if($location.path() == '/tenantSignup' || $location.path() =='/userSignup') {
                $scope.account = {};
            }

            if($location.path() == '/editProfile') {
                $scope.profileView = 'edit';
                getAccountDetails();
            }

            $scope.setPassword = false;
            if($stateParams) {
                if($stateParams.username) {
                    verifyMail();
                }
            }

            if($location.search()){
                var url = $location.search();
                if(url.userId)
                    $location.path('/users');
            }

            if($location.url() == '/login' || $location.url() == '/forgotPassword' || 
                $location.url() == '/tenantSignup' || $location.url() == '/userSignup') {
                if($rootScope.user) $scope.logOut();
            }

        }

        //User login
        $scope.login = function (user) {
            $http.post('/login', user)
                .success(function (data, status) {
                    AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Successfully logged in');
                    $rootScope.user =  data;
                    if($rootScope.user.scope == 'Admin' || 
                        $rootScope.user.scope == 'Tenant-Admin' || 
                        $rootScope.user.scope == 'User') {
                        userInfo.async().then(function(response) {
                            $scope.current_usr = response.data;
                            if($scope.current_usr.firstLogin === $scope.current_usr.lastLogin) 
                                $location.path('/changePassword');
                            else
                                $location.path('/home');
                        });
                    }
                        
                    getAccountDetails();
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
        $scope.forgotPassword = function (username) {
            $http.post('/forgotPassword', {username:username})
                .success(function (data, status) {
                    $rootScope.aMsg = {id:2};
                    $location.path('/login');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                })
        }

        //change password
        $scope.changePassword = function (details) {
            var obj = {
                oldpass:details.password,
                newpass:details.newpassword
            }
            $http.post('/changePassword', obj, {
                headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Password has successfully changed');
                    $location.path('/home');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                })
        }

        var verifyMail = function () {
            $http.put('/emailVerification', $stateParams)
                .success(function (data, status) {
                    if(data.scope == 'User') {
                        if(data.isActive == false) {
                            sendEmailToAdmins(data);
                            $scope.alertMsg = 3;
                        }
                    }
                    else
                        $scope.alertMsg = 2;

                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                })
        }

        var sendEmailToAdmins = function(user) {
            var params = {"user": user};
            $http.post('/sendActivationEmail', params)
                .success(function (data, status) {
                   

                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                })
        }

        var sendAccountCredentails = function(user) {
            var params = {"user": user};
            $http.post('/sendCredentials', params)
                .success(function (data, status) {
                   
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                })
        }

        //resendEmail Verification
        $scope.resendVerificationEmail = function (username) {
            var params = {};
            params.username = username;
            $http.post('/resendVerificationMail', params , {
                headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Verification Email has been successfully sent');             
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                })
        }

        //Tenant Self Registration
        $scope.tenantSelfRegistration = function (account_info) {
                var dump = angular.copy(account_info);
                delete account_info.user.passwordConfirm;
                $http.post('/tenantSelfRegistration', account_info)
                .success(function (data, status) {
                    $rootScope.aMsg = {id:1, name:'Company'};
                    $location.path('/login');                    
                })
                .error(function (data, status) {
                    account_info.user.passwordConfirm = dump.user.passwordConfirm;
                    growl.addErrorMessage(data.message);
                });
        
        }

        //TenantId Search Modal
        $scope.tenantSearchModal = function(isUser) {
            var modalInstance = $modal.open({
               templateUrl: 'tenantSearchModal.html',
                controller: 'searchModalInstanceCtrl',
                resolve: {
                    detail: function () {
                      return isUser;
                    }
                }
            });

            modalInstance.result.then(function(tenant) {
                if($scope.account == undefined)
                    $scope.account = {};
                if(tenant.description) {
                    $scope.account.tenantName = tenant.name+", "+tenant.description;
                }
                else
                    $scope.account.tenantName = tenant.name;
                $scope.tenantNameDup = angular.copy($scope.account.tenantName);
                $scope.account.tenantId = tenant._id;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        //Tenant-User Self Registration
        $scope.tenantUserSelfRegistration = function (account_info) {
            var valid;
                // delete account_info.passwordConfirm;
            if(account_info.tenantName._id) {
                account_info.tenantId = account_info.tenantName._id;
                delete account_info.tenantName;
                valid = true;
            } else {
                if(checkTenantName(account_info.tenantName) == true)
                    valid = true;
                else
                    valid = false;
            }
            var dump = account_info;
            if(valid) {
                $http.post('/user', account_info)
                .success(function (data, status) {
                    $rootScope.aMsg = {id:1, name:'User'};
                    $location.path('/login');
                })
                .error(function (data, status) {
                    account_info.passwordConfirm = dump;
                    growl.addErrorMessage(data.message);
                });
            }
            else {
                growl.addErrorMessage('Please select tenant');
            }
 
        }

        //Get Personal Account Details
        var getAccountDetails = function () {
            userInfo.async().then(function(response) {
                $scope.account = response.data;
                $scope.current_usr.firstName = response.data.firstName;
                $scope.current_usr.lastName = response.data.lastName;
                $scope.current_usr.isEmailVerified = response.data.isEmailVerified;
            });
        }

        //Update Personal Account Details
        $scope.updateProfile = function (account_info, valid) {
            if(valid){
                var id = angular.copy(account_info._id);
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
                });
            }
        }

        $scope.resetPassword = function (isTrue) {
            if(isTrue == true)
                $scope.setPassword = false;
            else
                $scope.setPassword = true;
        }

        var checkTenantName = function (name) {
            if($scope.tenantNameDup == name)
                return true;
            else 
                return false;
        }

        $scope.deleteMsg = function () {
            delete $rootScope.aMsg;
        }

        $scope.confirmationModal = function(isUser) {
            var modalInstance = $modal.open({
                templateUrl: 'confirmationModalContent.html',
                controller: 'confirmationModalInstanceCtrl',
                resolve: {
                    detail: function () {
                      return isUser;
                    }
                  }
            });
            modalInstance.result.then(function() {

            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        //accordion
        $scope.status = {
            open: true
        }

        _scope.init();
}]);

