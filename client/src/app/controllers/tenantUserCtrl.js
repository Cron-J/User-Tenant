
app.controller('tenantUserCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', '$stateParams', '$modal', '$log', 'userInfo',
    'countryList',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $stateParams, $modal, $log, userInfo, countryList) {
        var _scope = {};
        _scope.init = function() {
            if($rootScope.user.scope == 'Admin')
                $scope.view = 'create';
            if($rootScope.user.scope == 'Tenant-Admin')
                $scope.viewByTenant = 'create';
            // if($location.path() == '/home') {
            //     userInfo.async().then(function(response) {
            //         $scope.current_usr.firstName = response.data.firstName;
            //         $scope.current_usr.lastName = response.data.lastName;
            //         $scope.current_usr.tenantName = response.data.tenantId.name;
            //     });
            // }

            if($stateParams.tenantUserId) {
                $scope.view = 'view';
                getUserAccountDetails();
            }
            if($stateParams.tUserId) {
                $scope.viewByTenant = 'edit';
                getTenantUserbyTenant();
            }

            $scope.page ={
                view: 'search',
                role: 'admin'
            }

        }
        
        // $scope.user = {};
        $scope.authError = null;

        //Get Tenant-User account details by Admin
        $scope.getUserAccountDetails = function (id) {
            $http.get('/user/'+id, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.account = data;
                $scope.account.tenant = data.tenantId.name;
                $scope.account.tenantId = data.tenantId._id;
                $scope.page.view = 'edit';
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else
                    growl.addErrorMessage(data.message);
            });
        }

        //Get Tenant-User account details by Tenant-Admin
        var getTenantUserbyTenant = function () {
            $http.get('/userByTenant/'+ $stateParams.tUserId, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.current_usr.firstName = data.firstName;
                $scope.current_usr.lastName = data.lastName;
                $scope.account = data;
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else
                  growl.addErrorMessage(data.message);
            });
        }

        //Open tenant search modal
        $scope.searchModal = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'searchModalInstanceCtrl',
                size: size
            });

            modalInstance.result.then(function(tenant) {
                if(!$scope.account) $scope.account = {};
                $scope.account.tenantId = tenant._id;
                $scope.account.tenant = tenant.name;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        //Tenant-User account creation
        $scope.createTenantUserAccount = function (account_info, valid) {
            if(valid){
                // var dataDump = angular.copy(account_info);
                // account_info.address.country = account_info.address.country[0].code;
                $http.post('/tenantUser', account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    // AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Tenant-User has been created successfully');
                    if($rootScope.user.scope == 'Admin')
                        $location.path('/users');
                    if($rootScope.user.scope == 'Tenant-Admin')
                        $location.path('/tenantHome');

                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                      growl.addErrorMessage(data.message);
                    // account_info.address.country = dataDump.address.country;
                });
            }
        }

        //Update Tenant-User account details by Admin
        $scope.updateUserAccount = function (account_info, valid) {
            if(valid){
                var dataDump = angular.copy(account_info);
                account_info.address.country = account_info.address.country[0].code;
                delete account_info._id, delete account_info.createdAt, 
                delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                $http.put('/userByAdmin/'+$stateParams.tenantUserId, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('User account has been updated successfully');
                    getUserAccountDetails();
                    $scope.view = 'view';
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                    account_info.address.country = dataDump.address.country;
                });
                
            }
        }

        //Update Tenant-User account details by Tenant
        $scope.updatetenantUserAccountByTenant = function (account_info, valid) {
            if(valid){
                delete account_info._id, delete account_info.createdAt, 
                delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                account_info.tenantId = account_info.tenantId._id;
                $http.put('/user/'+$stateParams.tUserId, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Tenant-User account has been updated successfully');
                    getTenantUserbyTenant();
                    $scope.viewByTenant = 'view';
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                });
                
            }
        }

        //Search Tenant-User
        $scope.searchTenantUser = function(searchObj){
            if(!searchObj) searchObj = {};
            if(searchObj.tenantName != undefined) {
                if(searchObj.tenantName._id)
                        searchObj.tenantId = searchObj.tenantName._id;
            }
            $http.post('/searchUser', searchObj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.showUserResult = true;
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
        
        _scope.init();
}]);

