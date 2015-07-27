'use strict';

app.controller('confirmationModalInstanceCtrl', ['$scope', '$rootScope', '$http', 
    '$location', '$modalInstance', 'detail', '$stateParams',
    function ($scope, $rootScope, $http, $location, $modalInstance, detail, $stateParams) {

    //confirmation dialog box actions
    $scope.isRedirectConformed = function () {
        if($stateParams.tname || $location.path() == '/newTenant') 
            $location.path('/tenants');
        else if($stateParams.uname)
            $location.path('/users');
        else
            $location.path('/home');
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };



}]);

