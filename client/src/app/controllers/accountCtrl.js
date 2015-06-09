'use strict';

app.controller('accountCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', 'userInfo','countryList', '$modal', '$log',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        userInfo, countryList, $modal, $log) {
        var _scope = {};
        _scope.init = function() {
            $scope.loginForm = {
                remember: true
            };
            $scope.authError = null;
 
            if($location.path() == '/tenantSignup' || $location.path() =='/userSignup') {
                $scope.account = {};
            }
            if($location.path() == '/editProfile') {
                $scope.profileView = 'edit';
                getAccountDetails();
            }
            $scope.setPassword = false;
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
                    else if($rootScope.user.scope == 'User')
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
        $scope.forgotPassword = function (username) {
            $http.post('/forgotPassword', {username:username})
                .success(function (data, status) {
                    growl.addSuccessMessage('Password has been successfully to registered email with your username');
                    $location.path('/login');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                })
        }

        //Tenant Search by name
        $scope.searchTenantByName = function($viewValue){
            var temp = [];
            var obj = {};
            obj['name'] = $viewValue;
            // obj['value'] = $viewValue;
            temp.push(obj);
            return $http.post('/searchTenant', obj).
            then(function(data){
              var tenantList = [];
              angular.forEach(data.data, function(item){   
                if(item.description != undefined){
                    tenantList.push({ "name": item.name, "_id": item._id, 
                    "desc":item.description, "comma": ', ' });
                } else {
                    tenantList.push({ "name": item.name, "_id": item._id });
                }
              });
              return tenantList;
            }).catch(function(error){
                growl.addErrorMessage('oops! Something went wrong');
            });
        }


        //Tenant Self Registration
        $scope.tenantSelfRegistration = function (account_info) {
                var dump = angular.copy(account_info.passwordConfirm);
                delete account_info.passwordConfirm;
                $http.post('/tenantSelfRegistration', account_info)
                .success(function (data, status) {
                    growl.addSuccessMessage('Tenant has been successfully registered');
                    $location.path('login');
                    $scope.account = {};
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                    account_info.passwordConfirm = dump;
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
                delete account_info.passwordConfirm;
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
                if(valid) {
                    $http.post('/user', account_info)
                    .success(function (data, status) {
                        growl.addSuccessMessage('User has been successfully registered');
                        $location.path('login');
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

        _scope.init();
}]);

