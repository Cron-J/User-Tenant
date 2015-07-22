'use strict';

app.controller('tenantCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', '$stateParams', 'userInfo',
    '$modal', '$log', 'localStorageService', '$previousState', 
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $stateParams, userInfo, $modal, $log, localStorageService, $previousState) {
        var _scope = {};
        _scope.init = function() {
            if($location.path() == '/home') {
                userInfo.async().then(function(response) {
                    $scope.current_usr.tenantName = response.data.tenantId.name;
                });
                $scope.inActiveUsers = false;
                $scope.getTenantUsers();
            }
            $scope.page ={
                view: 'edit',
                role: 'admin'
            }
            if($location.path() == '/newTenant')
                $scope.page.view = 'create';
            var previous = $previousState.get();
            var lsKeys = localStorageService.keys();
            if(previous){
                if(previous.state.name == 'tenantInfo' || previous.state.name == 'usersOfTenant') {
                    if(lsKeys.indexOf('tenantsList') != -1){
                        $scope.showResult = true;
                        $scope.resultList = localStorageService.get('tenantsList');
                        if(lsKeys.indexOf('tenantSearchObj' != -1))
                            $scope.srch = localStorageService.get('tenantSearchObj');
                        $scope.groupToPages();
                    }
                }
            }
            if(previous == null) {
                localStorageService.remove('tenantSearchObj');
            }
            if($stateParams.tname) 
                $scope.getTenant();
            
        }
       
        // $scope.user = {};
        $scope.authError = null;

        //Get TenantUsers List for Particular Tenant
        $scope.getTenantUsersOfTenant = function (id) {
            $location.path('/users/'+id);
        }

        //Get Tenant Details
        $scope.getTenant = function () {
            if(!id) var id;
            if($stateParams.tenantId)
                id = $stateParams.tenantId;
            if($stateParams.selectedId)
                id = $stateParams.selectedId;
            $http.get('/tenant/'+ $stateParams.tname, {
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
                    $location.path('/tenants');
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

        $scope.createTenant = function (srch) {
            if(srch) $scope.srchInfo = srch;
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
                    $scope.searchTenant(localStorageService.get('tenantSearchObj'));
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
            if(searchObj){
                localStorageService.set('tenantSearchObj', searchObj);
            }
            if(!searchObj) searchObj = {};
            $http.post('/searchTenant', searchObj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.showResult = true;
                $scope.resultList = data;
                localStorageService.set('tenantsList', $scope.resultList);
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

