'use strict';

app.controller('tenantUserCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', '$stateParams', '$modal', '$log', 'userInfo',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $stateParams, $modal, $log, userInfo) {
        var _scope = {};
        _scope.init = function() {
            console.log($rootScope.user);
            if($rootScope.user.scope == 'Admin')
                $scope.view = 'create';
            if($rootScope.user.scope == 'Tenant-Admin')
                $scope.viewByTenant = 'create';
            if($stateParams.tenantUserId) {
                $scope.view = 'view';
                getUserAccountDetails();
            }
            if($stateParams.tUserId) {
                $scope.viewByTenant = 'view';
                getTenantUserbyTenant();
            }
            if($location.path() == '/home') {
                userInfo.async().then(function(response) {
                    $scope.current_usr.firstName = response.data.firstName;
                    $scope.current_usr.lastName = response.data.lastName;
                });
            }
        }
        
        // $scope.user = {};
        $scope.authError = null;


        //Get Tenant-User account details
        var getUserAccountDetails = function () {
            $http.get('/user/'+$stateParams.tenantUserId, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.account = data;
                $scope.account.tenant = data.tenantId.name;
                $scope.account.tenantId = data.tenantId._id;
                // $rootScope.userDump = angular.copy($rootScope.user);
                $scope.current_usr.firstName = data.firstName;
                $scope.current_usr.lastName = data.lastName;
                console.log('tenant get', $rootScope.userDump);
            })
            .error(function (data, status) {
                growl.addErrorMessage(data.message);
            });
        }

        //Get Tenant-User by Tenant-Admin
        var getTenantUserbyTenant = function () {
            $http.get('/userByTenant/'+ $stateParams.tUserId, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.account = data;
                $scope.current_usr.firstName = data.firstName;
                $scope.current_usr.lastName = data.lastName;
            })
            .error(function (data, status) {
                growl.addErrorMessage(data.message);
            });
        }


        //Get page view mode
        // $scope.getView = function (mode) {
        //    $scope.view = "create"; 
        //    console.log();
        // }

        //Open tenant search modal
        $scope.searchModal = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'searchModalInstanceCtrl',
                size: size
            });

            modalInstance.result.then(function(tenant) {
                if(!$scope.account) $scope.account = {};
                $scope.account.tenantId = tenant._id;
                $scope.account.tenant = tenant.name;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        //Tenant-User account creation
        $scope.createTenantUserAccount = function (account_info, valid) {
            if(valid){
                 $http.post('/tenantUser', account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    // AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Tenant-User has been created successfully');
                    if($rootScope.user.scope == 'Admin')
                        $location.path('/users');
                    if($rootScope.user.scope == 'Tenant-Admin')
                        $location.path('/tenantHome');

                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }

        //Update Tenant-User account
        $scope.updateUserAccount = function (account_info, valid) {
            if(valid){
                delete account_info._id, delete account_info.createdAt, 
                delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                $http.put('/userByAdmin/'+$stateParams.tenantUserId, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Account has been updated successfully');
                    $location.path('/users');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }

        //Update Tenant-User account by Tenant
        $scope.updatetenantUserAccountByTenant = function (account_info, valid) {
            if(valid){
                delete account_info._id, delete account_info.createdAt, 
                delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                $http.put('/tenantUser/'+$stateParams.tUserId, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Account has been updated successfully');
                    $location.path('/tenantHome');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }
        _scope.init();
}]);

