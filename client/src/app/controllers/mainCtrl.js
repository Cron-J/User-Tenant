'use strict';

app.controller('mainCtrl', ['$scope', '$rootScope', '$http', 'userInfo', 'countryList',
    function ($scope, $rootScope, $http, userInfo, countryList) {
        var _scope = {};
        _scope.init = function () {
        	$scope.current_usr = {};
	        if($rootScope.user) {
		        userInfo.async().then(function(response) {
		          $scope.current_usr = response.data;
		        });
		        countryList.async().then(function(response) {
			        $scope.countryList = response.data;
		        });
		      }
        }

	      $scope.clearCountrySelection = function () {
	      	if($scope.countryList) {
		      	for (var i = 0; i < $scope.countryList.length; i++) {
		      		$scope.countryList[i].ticked = false;
		      	};
		      }
	      }

	      $scope.unAuthorized - function () {
	      	delete $rootScope.user;
	      }

	      _scope.init();
}]);