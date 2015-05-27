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

        $scope.tenantSearchModal = function(isUser) {
            var modalInstance = $modal.open({
               templateUrl: 'tenantSearchModal.html',
                controller: 'searchModalInstanceCtrl',
                resolve: {
					        detail: function () {
					          return isUser;
					        }
					      }
            });

            modalInstance.result.then(function(tenant) {
            	if($scope.account == undefined)
            		$scope.account = {};
                if(tenant.description) 
            	    $scope.account.tenantName = tenant.name+", "+tenant.description;
            	else
                    $scope.account.tenantName = tenant.name;
                $scope.account.tenantId = tenant._id;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

	      _scope.init();
}]);