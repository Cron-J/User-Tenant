'use strict';

app.controller('confirmationModalInstanceCtrl', ['$scope', '$rootScope', '$http', 
    '$location', '$modalInstance', 'detail',
    function ($scope, $rootScope, $http, $location, $modalInstance, detail) {

    var isUser = detail;
    //confirmation dialog box actions
    $scope.isRedirectConformed = function () {
        $modalInstance.close();
            if($rootScope.user) {
                if($rootScope.user.scope == 'Admin') {
                    if(isUser) $location.path('/users');
                    else $location.path('/tenants');
                }
                else if($rootScope.user.scope == 'Tenant-Admin') 
                    $location.path('/tenantHome');
                else if($rootScope.user.scope == 'User') 
                    $location.path('/home');
            }
            else 
                $location.path('/login');
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };



}]);

