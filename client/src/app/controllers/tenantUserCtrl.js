
app.controller('tenantUserCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', '$stateParams', '$modal', '$log', 'userInfo',
    'countryList',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $stateParams, $modal, $log, userInfo, countryList) {
        var _scope = {};
        _scope.init = function() {
            if($rootScope.user.scope == 'Admin')
                $scope.view = 'create';
            if($rootScope.user.scope == 'Tenant-Admin')
                $scope.viewByTenant = 'create';
            if($location.path() == '/home') {
                userInfo.async().then(function(response) {
                    $scope.current_usr.firstName = response.data.firstName;
                    $scope.current_usr.lastName = response.data.lastName;
                });
            }

            if($stateParams.tenantUserId) {
                $scope.view = 'view';
                getUserAccountDetails();
            }
            if($stateParams.tUserId) {
                $scope.viewByTenant = 'edit';
                getTenantUserbyTenant();
            }

        }
        
        // $scope.user = {};
        $scope.authError = null;


        //Get Tenant-User account details by Admin
        var getUserAccountDetails = function () {
            $http.get('/user/'+$stateParams.tenantUserId, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.current_usr.firstName = data.firstName;
                $scope.current_usr.lastName = data.lastName;
                $scope.account = data;
                $scope.account.tenant = data.tenantId.name;
                $scope.account.tenantId = data.tenantId._id;
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else
                    growl.addErrorMessage(data.message);
            });
        }

        //Get Tenant-User account details by Tenant-Admin
        var getTenantUserbyTenant = function () {
            $http.get('/userByTenant/'+ $stateParams.tUserId, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.current_usr.firstName = data.firstName;
                $scope.current_usr.lastName = data.lastName;
                $scope.account = data;
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else
                  growl.addErrorMessage(data.message);
            });
        }

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
                var dataDump = angular.copy(account_info);
                account_info.address.country = account_info.address.country[0].code;
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
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                      growl.addErrorMessage(data.message);
                    account_info.address.country = dataDump.address.country;
                });
            }
        }

        //Update Tenant-User account details by Admin
        $scope.updateUserAccount = function (account_info, valid) {
            if(valid){
                var dataDump = angular.copy(account_info);
                account_info.address.country = account_info.address.country[0].code;
                delete account_info._id, delete account_info.createdAt, 
                delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                $http.put('/userByAdmin/'+$stateParams.tenantUserId, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('User account has been updated successfully');
                    getUserAccountDetails();
                    $scope.view = 'view';
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

        //Update Tenant-User account details by Tenant
        $scope.updatetenantUserAccountByTenant = function (account_info, valid) {
            if(valid){
                delete account_info._id, delete account_info.createdAt, 
                delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                $http.put('/user/'+$stateParams.tUserId, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Tenant-User account has been updated successfully');
                    getTenantUserbyTenant();
                    $scope.viewByTenant = 'view';
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                });
                
            }
        }
        
        _scope.init();
}]);

