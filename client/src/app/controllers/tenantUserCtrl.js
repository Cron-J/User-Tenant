'use strict';

app.controller('tenantUserCtrl', ['$scope', '$http', '$location', 
    'AuthServ', 'growl', '$filter',
    function ($scope, $http, $location, AuthServ, growl, $filter) {
        var _scope = {};
        _scope.init = function() {
           getAllTenants();
        }
        
        $scope.user = {};
        $scope.authError = null;

        //Get all tenants
        var getAllTenants = function () {
            $http.get('/tenant' , {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.tenantsList = data
            })
            .error(function (data, status) {
                growl.addErrorMessage(data.message);
            });
        }

        //Tenant-User account creation
        $scope.createTenantUserAccount = function (account_info, valid) {
            if(valid){
                 $http.post('/tenantUser', account_info)
                .success(function (data, status) {
                    // AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Account has been created successfully');
                    $location.path('app');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }

        _scope.init();
}]);

