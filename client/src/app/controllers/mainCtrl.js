'use strict';

app.controller('mainCtrl', ['$scope', '$location', '$rootScope', '$http', '$modal',
		'$log','userInfo', 'countryList', 'AuthServ', 'growl', 
    function ($scope, $location, $rootScope, $http, $modal, $log, userInfo, 
    	countryList, AuthServ, growl) {
        var _scope = {};
        _scope.init = function () {
        	$scope.current_usr = {};
        	if($rootScope.user) {
                $scope.isHeader = true;
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

	       //Tenant Search by name
        $scope.searchTenantByName = function($viewValue){
            var temp = [];
            var obj = {};
            obj['name'] = $viewValue;
            // obj['value'] = $viewValue;
            temp.push(obj);
            return $http.post('/searchTenant', obj).
            then(function(data){
              var tenantList = [];
              angular.forEach(data.data, function(item){   
                if(item.description != undefined){
                    tenantList.push({ "name": item.name, "_id": item._id, 
                    "desc":item.description, "comma": ', ' });
                } else {
                    tenantList.push({ "name": item.name, "_id": item._id });
                }
              });
              return tenantList;
            }).catch(function(error){
                growl.addErrorMessage('oops! Something went wrong');
            });
        }

	      _scope.init();
}]);