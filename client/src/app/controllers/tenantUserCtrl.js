'use strict';

app.controller('tenantUserCtrl', ['$scope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', '$stateParams',
    function ($scope, $http, $location, AuthServ, growl, $filter, $stateParams) {
        var _scope = {};
        _scope.init = function() {
           if($stateParams.tenantUserId)
                getUserAccountDetails()
        }
        
        $scope.user = {};
        $scope.authError = null;

        //Get all tenants
        var getAllTenants = function () {
            $http.get('/tenant' , {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.tenantsList = data;
            })
            .error(function (data, status) {
                growl.addErrorMessage(data.message);
            });
        }

        //Get Tenant-User account details
       var getUserAccountDetails = function () {
            $http.get('/user/'+$stateParams.tenantUserId, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.user = data;
                $scope.view = 'view';
            })
            .error(function (data, status) {
                growl.addErrorMessage(data.message);
            });
        }

        //Update Tenant-User account
        $scope.updateUserAccount = function (account_info, valid) {
            if(valid){
                $http.put('/userByAdmin/'+account_info._id, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Account has been updated successfully');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }

        _scope.init();
}]);

