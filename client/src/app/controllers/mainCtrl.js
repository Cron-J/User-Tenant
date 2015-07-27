'use strict';

app.controller('mainCtrl', ['$scope', '$location', '$rootScope', '$http', '$modal',
		'$log','userInfo', 'suggestionsList', 'AuthServ', 'growl', '$stateParams',
    function ($scope, $location, $rootScope, $http, $modal, $log, userInfo, 
    	suggestionsList, AuthServ, growl, $stateParams) {
        var _scope = {};
        _scope.init = function () {
        	
            $scope.getLoginUserInfo();
        }

        $scope.getLoginUserInfo = function(){
            if($rootScope.user) {
                $scope.isHeader = true;
                $scope.current_usr = {};
                userInfo.async().then(function(response) {
                  $scope.current_usr = response.data;
                });
                
            }
        }

        $scope.checkPermission = function (id) {
            if($rootScope.user && $rootScope.user.permissions) {
                if($rootScope.user.permissions.indexOf(id) === -1)
                    return false;
                else
                    return true;
            }
        }
        //Tenant Self Registration
        $scope.tenantSelfRegistration = function (account_info) {
                var dump = angular.copy(account_info);
                delete account_info.user.passwordConfirm;
                $http.post('/tenantSelfRegistration', account_info)
                .success(function (data, status) {
                    $rootScope.aMsg = {id:1, name:'Company'};
                    $location.path('/login');                    
                })
                .error(function (data, status) {
                    account_info.user.passwordConfirm = dump.user.passwordConfirm;
                    growl.addErrorMessage(data.message);
                });
        
        }

        

        //Tenant-User Self Registration
        $scope.tenantUserSelfRegistration = function (account_info) {
            var valid;
                // delete account_info.passwordConfirm;
            if(account_info.tenantName._id) {
                account_info.tenantId = account_info.tenantName._id;
                delete account_info.tenantName;
                valid = true;
            } else {
                if(checkTenantName(account_info.tenantName) == true)
                    valid = true;
                else
                    valid = false;
            }
            var dump = account_info;
            if(valid) {
                $http.post('/user', account_info)
                .success(function (data, status) {
                    $rootScope.aMsg = {id:1, name:'User'};
                    $location.path('/login');
                })
                .error(function (data, status) {
                    account_info.passwordConfirm = dump;
                    growl.addErrorMessage(data.message);
                });
            }
            else {
                growl.addErrorMessage('Please select tenant');
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
            return $http.post('/tenantsInfo', obj,  {
                headers: AuthServ.getAuthHeader()
            }).
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

        //Tenant Search by name
        $scope.searchTenantInfo = function(obj){
            if(!obj) obj = {};
            $http.post('/tenantsInfo', obj,  {
                headers: AuthServ.getAuthHeader()
            }).
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