'use strict';

app.controller('tenantCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', '$stateParams', 'userInfo', 'countryList',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $stateParams, userInfo, countryList) {
        var _scope = {};
        _scope.init = function() {
            $scope.isUser = true;
            if($location.path() == '/tenantHome') {
                userInfo.async().then(function(response) {
                    $scope.current_usr.firstName = response.data.firstName;
                    $scope.current_usr.lastName = response.data.lastName;
                    $scope.current_usr.tenantName = response.data.tenantId.name;
                });
                $scope.inActiveUsers = false;
                $scope.getTenantUsers();
            }
            if($stateParams.tenantId) {
                $scope.view = 'edit';
                $scope.getTenant();
            }
            if($location.path() == '/addUser'){
                $scope.inActiveUsers = true;
                inActiveUsersList();
            }
            if($location.path() == '/tenantusersOfSelectedTenant/'+$stateParams.selectedId) {
                allusers();
                $scope.getTenant();
            }
        }
       
        // $scope.user = {};
        $scope.authError = null;

        //getInfo 
        var loadInfo = function () {

        }

        //Get Tenant Details
        $scope.getTenant = function () {
            var id;
            if($stateParams.tenantId)
                id = $stateParams.tenantId;
            else
                id = $stateParams.selectedId;
            $http.get('/tenant/'+ id, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.current_usr.firstName = data.name;
                $scope.current_usr.lastName = '';
                $scope.account = data;
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else
                    growl.addErrorMessage(data.message);
            });
        }
        
        //Tenant account creation
        $scope.createTenantAccount = function (account_info, valid) {
            if(valid){
                $http.post('/tenant', account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Tenant has been created successfully');
                    $location.path('tenants');
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                });
            }
        }

        //Update tenant account
        $scope.updateTenantAccount = function (account_info, valid) {
            if(valid){
                var dataDump = angular.copy(account_info);
                delete account_info._id, delete account_info.__v, 
                delete account_info.createdAt, delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                $http.put('/tenant/'+$stateParams.tenantId, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    // AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Tenant account has been updated successfully');
                    $scope.getTenant();
                    $scope.view = 'view';
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                });        
               $scope.account.tenantId = dataDump.tenantId;
            }
        }

        //Get Tenant-User Details
        $scope.getTenantUser = function (id) {
           $location.path('/tenantUser/'+id);
        }

        //Get Tenant-Users List
        $scope.getTenantUsers = function () {
            $http.get('/tenantUser/'+ $scope.current_usr._id, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.resultList = data;
                $scope.currentPage = 0;
                $scope.groupToPages();
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

        //Get all Tenant-Users of a particular tenant
        var allusers = function () {
            var searchObj = {};
            searchObj.tenantId = $stateParams.selectedId;
            $http.post('/searchUser', searchObj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.resultList = data;
                $scope.currentPage = 0;
                $scope.groupToPages();
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else
                    growl.addErrorMessage(data.message);
            });
        }

        //Activate Tenant-User
        
        $scope.activateTenantUser = function(id){
            var obj = {
                "id": id
            }
            $http.post('/activateUser', obj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                inActiveUsersList();
                growl.addSuccessMessage('User account has been activated successfully');

            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

        //Deactivate Tenant-User
         $scope.deactivateTenantUser = function(id){
            var obj = {
                "id": id
            }
            $http.post('/deActivateUser', obj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.getTenantUsers();
                growl.addSuccessMessage('User account has been deactivated successfully');
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

        //Inactive Users list 
        var inActiveUsersList = function () {
            $http.get('/tenantDeactiveUser/'+ $scope.current_usr._id, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.resultList = data;
                $scope.currentPage = 0;
                $scope.groupToPages();
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

        //Search
        $scope.search = function(searchObj){
            if(!searchObj) searchObj = {};
            $http.post('/searchUser', searchObj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.showResult = true;
                $scope.resultList = data;
                $scope.currentPage = 0;
                $scope.groupToPages();           
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

}]);

