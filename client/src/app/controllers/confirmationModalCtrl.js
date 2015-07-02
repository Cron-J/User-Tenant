'use strict';

app.controller('confirmationModalInstanceCtrl', ['$scope', '$rootScope', '$http', 
    '$location', '$modalInstance', 'detail',
    function ($scope, $rootScope, $http, $location, $modalInstance, detail) {

    var view;
    //confirmation dialog box actions
    $scope.isRedirectConformed = function () {
        if($location.path() == '/editProfile' || $location.path() == '/changePassword') 
            $location.path('/home');
        else 
            view = 'search';
        $modalInstance.close(view);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };



}]);

