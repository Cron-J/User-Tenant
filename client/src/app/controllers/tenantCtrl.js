'use strict';

app.controller('tenantCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', '$stateParams', 'userInfo', 'countryList',
    '$modal',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $stateParams, userInfo, countryList, $modal) {
        var _scope = {};
        _scope.init = function() {
            if($location.path() == '/home') {
                userInfo.async().then(function(response) {
                    $scope.current_usr.firstName = response.data.firstName;
                    $scope.current_usr.lastName = response.data.lastName;
                    $scope.current_usr.tenantName = response.data.tenantId.name;
                });
                $scope.inActiveUsers = false;
                $scope.getTenantUsers();
            }
            // if($stateParams.tenantId) {
            //     $scope.view = 'edit';
            //     $scope.getTenant();
            // }
            // if($location.path() == '/addUser'){
            //     $scope.inActiveUsers = true;
            //     inActiveUsersList();
            // }
            // if($location.path() == '/tenantusersOfSelectedTenant/'+$stateParams.selectedId) {
            //     allusers();
            //     $scope.getTenant();
            // }

            $scope.page ={
                view: 'search',
                role: 'admin'
            }
            console.log($scope.page);
        }
       
        // $scope.user = {};
        $scope.authError = null;

        //getInfo 
        var loadInfo = function () {

        }

        //Get Tenant Details
        $scope.getTenant = function (id) {
            if(!id) var id;
            if($stateParams.tenantId)
                id = $stateParams.tenantId;
            if($stateParams.selectedId)
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
                $http.post('/tenantCreation', account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    $scope.page.view = 'search';
                    growl.addSuccessMessage('Tenant has been created successfully');
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                });
            }
        }

        $scope.createTenant = function () {
            $scope.account = {};
            $scope.page.view = 'create';
        }

        //Update tenant account
        $scope.updateTenantAccount = function (account_info, valid) {
            if(valid){
                var dataDump = angular.copy(account_info);
                delete account_info._id, delete account_info.__v, 
                delete account_info.createdAt, delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                $http.put('/tenant/'+dataDump._id, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Tenant account has been updated successfully');
                    $scope.getTenant(dataDump._id);
                    $scope.page.view = 'view';
                    console.log($scope.page.view);
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                });        
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
            modalInstance.result.then(function(view) {
                $scope.page.view = view;

            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        //Search Tenant
        $scope.searchTenant = function(searchObj){
            if(!searchObj) searchObj = {};
            $http.post('/searchTenant', searchObj,  {
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
                else
                    growl.addErrorMessage(data.message);
            });
        }

        //Pagination
        $scope.pagedItems = [];
        $scope.currentPage = 0;
        $scope.filteredItems = [];
        $scope.itemsPerPage = 5;
        $scope.min = 0;
        $scope.max =5;
        // $scope.groupToPages();

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
            if($scope.min > 0){ 
                $scope.min--;
            }
            if($scope.max > 5){ 
                $scope.max--;
            }
        };
        
        $scope.nextPage = function () {
            if ($scope.currentPage < $scope.pagedItems.length - 1) {
                $scope.currentPage++;
            }
            $scope.limit = $scope.pagedItems.length;
            if($scope.min < $scope.limit && $scope.min <= $scope.limit - 6) {
                $scope.min++;
            }
            if($scope.max < $scope.limit && $scope.min <= $scope.limit) {
                $scope.max++;
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

