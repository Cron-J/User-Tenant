'use strict';

app.controller('tenantCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', '$stateParams', 'userInfo', 'countryList',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $stateParams, userInfo, countryList) {
        var _scope = {};
        _scope.init = function() {
            $scope.isUser = true;
            if($location.path() == '/tenantHome') {
                userInfo.async().then(function(response) {
                    console.log(response);
                    $scope.current_usr.firstName = response.data.firstName;
                    $scope.current_usr.lastName = response.data.lastName;
                });
                $scope.inActiveUsers = false;
                $scope.getTenantUsers();
            }
            if($stateParams.tenantId) {
                $scope.view = 'edit';
                $scope.getTenant();
            }
            if($location.path() == '/addUser'){
                $scope.inActiveUsers = true;
                inActiveUsersList();
            }
            console.log($stateParams.selectedId);
            if($location.path() == '/tenantusersOfSelectedTenant/'+$stateParams.selectedId) {
                allusers();
                $scope.getTenant();
            }
        }
       
        // $scope.user = {};
        $scope.authError = null;

        //getInfo 
        var loadInfo = function () {

        }

        //Get Tenant Details
        $scope.getTenant = function () {
            var id;
            if($stateParams.tenantId)
                id = $stateParams.tenantId;
            else
                id = $stateParams.selectedId;
            $http.get('/tenant/'+ id, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.current_usr.firstName = data.name;
                $scope.current_usr.lastName = '';
                $scope.account = data;
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else
                    growl.addErrorMessage(data.message);
            });
        }
        
        //Tenant account creation
        $scope.createTenantAccount = function (account_info, valid) {
            if(valid){
                $http.post('/tenant', account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Tenant has been created successfully');
                    $location.path('tenants');
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                });
            }
        }

        //Update tenant account
        $scope.updateTenantAccount = function (account_info, valid) {
            if(valid){
                var dataDump = angular.copy(account_info);
                delete account_info._id, delete account_info.__v, 
                delete account_info.createdAt, delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                $http.put('/tenant/'+$stateParams.tenantId, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    // AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Tenant account has been updated successfully');
                    $scope.getTenant();
                    $scope.view = 'view';
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                });        
               $scope.account.tenantId = dataDump.tenantId;
            }
        }

        //Get Tenant-User Details
        $scope.getTenantUser = function (id) {
           $location.path('/tenantUser/'+id);
        }

        //Get Tenant-Users List
        $scope.getTenantUsers = function () {
            $http.get('/tenantUser/'+ $scope.current_usr._id, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.resultList = data;
                $scope.currentPage = 0;
                $scope.groupToPages();
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

        //Get all Tenant-Users of a particular tenant
        var allusers = function () {
            var searchObj = {};
            searchObj.tenantId = $stateParams.selectedId;
            $http.post('/searchUser', searchObj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.resultList = data;
                $scope.currentPage = 0;
                $scope.groupToPages();
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else
                    growl.addErrorMessage(data.message);
            });
        }

        //Activate Tenant-User
        
        $scope.activateTenantUser = function(id){
            var obj = {
                "id": id
            }
            $http.post('/activateUser', obj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                inActiveUsersList();
                growl.addSuccessMessage('User account has been activated successfully');

            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

        //Deactivate Tenant-User
         $scope.deactivateTenantUser = function(id){
            var obj = {
                "id": id
            }
            $http.post('/deActivateUser', obj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.getTenantUsers();
                growl.addSuccessMessage('User account has been deactivated successfully');
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

        //Inactive Users list 
        var inActiveUsersList = function () {
            $http.get('/tenantDeactiveUser/'+ $scope.current_usr._id, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.resultList = data;
                $scope.currentPage = 0;
                $scope.groupToPages();
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

        //Search
        $scope.search = function(searchObj){
            if(!searchObj) searchObj = {};
            $http.post('/searchUser', searchObj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.showResult = true;
                $scope.resultList = data;
                $scope.currentPage = 0;
                $scope.groupToPages();           
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

        //Pagination
        $scope.pagedItems = [];
        $scope.currentPage = 0;
        $scope.filteredItems = [];
        $scope.filteredItems1 = [];
        $scope.itemsPerPage = 20;
        $scope.range = function (start, end) {
            var ret = [];
            if (!end) {
                end = start;
                start = 0;
            }
            for (var i = start; i < end; i++) {
                ret.push(i);
            }
            return ret;
        };

        $scope.prevPage = function () {
            if ($scope.currentPage > 0) {
                $scope.currentPage--;
            }
        };

        $scope.nextPage = function () {
            if ($scope.currentPage < $scope.pagedItems.length - 1) {
                $scope.currentPage++;
            }
        };
        
        $scope.setPage = function () {
            $scope.currentPage = this.n;
        };
      
        $scope.groupToPages = function () {
          $scope.pagedItems = [];
          $scope.filteredItems = $scope.resultList;
          $scope.filtered();
        };

        $scope.filtered = function () {
          if($scope.filteredItems){
            for (var i = 0; i < $scope.filteredItems.length; i++) {
                if (i % $scope.itemsPerPage === 0) {
                    $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
                } else {
                    $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
                }
            }
          }   
        }
     
        $scope.groupToPages();

        _scope.init();
}]);

