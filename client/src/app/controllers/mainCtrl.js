'use strict';

app.controller('mainCtrl', ['$scope', '$rootScope', '$http', 'userInfo',
    function ($scope, $rootScope, $http, userInfo) {
        var _scope = {};
        $scope.current_usr = {};
        if($rootScope.user) {
	        userInfo.async().then(function(response) {
	          $scope.current_usr = response.data;
	        });
	      }
}]);