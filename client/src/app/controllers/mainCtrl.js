'use strict';

app.controller('mainCtrl', ['$scope', '$location', '$rootScope', '$http', '$modal',
		'$log','userInfo', 'countryList', 'AuthServ', 'growl',
    function ($scope, $location, $rootScope, $http, $modal, $log, userInfo, 
    	countryList, AuthServ, growl) {
        var _scope = {};
        _scope.init = function () {
        	$scope.current_usr = {};
	        	if($rootScope.user) {
			        userInfo.async().then(function(response) {
			          $scope.current_usr = response.data;
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

	      $scope.sessionExpire = function () {
	      	delete $rootScope.user;
            growl.addErrorMessage('Session has expired');
	      }

	      $scope.confirmationModal = function(isUser) {
            var modalInstance = $modal.open({
                templateUrl: 'confirmationModalContent.html',
                controller: 'confirmationModalInstanceCtrl',
                resolve: {
					        detail: function () {
					          return isUser;
					        }
					      }
            });
            modalInstance.result.then(function(tenant) {
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }


	      _scope.init();
}]);