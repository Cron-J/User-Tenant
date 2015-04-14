'use strict';

app.controller('tenantUserCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', '$stateParams', '$modal', '$log',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $stateParams, $modal, $log) {
        var _scope = {};
        _scope.init = function() {
            $scope.view = 'create';
            if($stateParams.tenantUserId) {
                $scope.view = 'view';
                getUserAccountDetails();
            }
        }
        
        $scope.user = {};
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
                // $rootScope.user.firstName = data.firstName;
                // $rootScope.user.lastName = data.lastName;
                console.log('tenant get', $rootScope.userDump);
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
                    growl.addSuccessMessage('Tenant-User account has been created successfully');
                    $location.path('users');
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

        _scope.init();
}]);

