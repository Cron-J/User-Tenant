'use strict';

app.controller('accountCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', 'userInfo', 'suggestionsList','$modal', '$log', '$state',
    '$stateParams', '$timeout', 'USER_ACTIVITIES', 
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        userInfo, suggestionsList, $modal, $log, $state, $stateParams, $timeout, USER_ACTIVITIES) {
        var _scope = {};
        _scope.init = function() {
            $scope.loginForm = {
                remember: true
            };
            $scope.authError = null;

            if($stateParams.page) {
                $scope.signupType = $stateParams.page;
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

        //User Self Registration
        $scope.userSelfRegistration = function (data) {
            var account_info = data,
                valid;
                // delete account_info.passwordConfirm;
            if(account_info.tenantId) {
                account_info.user.tenantId = account_info.tenantId;
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
                $http.post('/user', account_info.user)
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


        //User login
        $scope.login = function (user) {
            $http.post('/login', user)
                .success(function (data, status) {
                    AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Successfully logged in');
                    $rootScope.user =  data;
                    if($rootScope.user) {
                    console.log($rootScope.user.permissions);
                        userInfo.async().then(function(response) {
                            $scope.current_usr = response.data;
                            if($scope.current_usr.firstLogin === $scope.current_usr.lastLogin && 
                                $scope.current_usr.createdBy != 'Self') 
                                $location.path('/changePassword');
                            else
                                $location.path('/home');
                        });
                    }
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
                    console.log(data);
                        if(data.isActive == false) {
                            sendEmailToAdmins(data);
                            $scope.alertMsg = 3;
                        }
                        else $scope.alertMsg = 2;

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

        
        $scope.generateRandomUserNames = function (email) {
            if(email) {
                suggestionsList.async(email).then(function(response) {
                    $scope.suggestions = response.data;
                });
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
                delete account_info._id, delete account_info.scope, 
                delete account_info.createdAt, delete account_info.createdBy, delete account_info.updatedAt,
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

