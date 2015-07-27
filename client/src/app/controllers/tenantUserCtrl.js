
app.controller('tenantUserCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter', '$stateParams', '$modal', '$log', 'userInfo',
    'suggestionsList', 'rolesList', 'localStorageService', '$previousState',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $stateParams, $modal, $log, userInfo, suggestionsList, rolesList,localStorageService,
        $previousState) {
        var _scope = {};
        _scope.init = function() {
            if($location.path() == '/users') {
               $scope.srch ={scope : []};
            }
            if($stateParams.tenantName || $rootScope.user.tenantId)
                $scope.tenantView = true;

            rolesList.async().then(function(response) {
                if($scope.tenantView) {
                    response.data.shift();
                }
                $scope.rolesList = response.data;
            });
            $scope.multiSelectText = {displayProp: 'label'};

            $scope.page ={
                view: 'edit',
                role: 'admin'
            }

            $scope.srch = {scope:[]};
            if($location.path() == "/newUser") {
                $scope.account = {scope:[]};
                $scope.page.view = 'create';
            }
            if($scope.user.scope[0] == 1)
                $scope.page.role = 'tenant-admin';
            var previous = $previousState.get();
            var lsKeys = localStorageService.keys();
            if(previous) {
                if(previous.state.name == 'userEdit') {
                    if(lsKeys.indexOf('usersList') != -1){
                        $scope.showUserResult = true;
                        if(lsKeys.indexOf('userSearchObj') > -1)
                            $scope.srch = localStorageService.get('userSearchObj');
                        $scope.resultList = localStorageService.get('usersList');
                        $scope.groupToPages();
                    }
                } 
            }
            if(previous == null) {
                localStorageService.remove('userSearchObj');
            }

            if($stateParams.uname || $stateParams.selectedId){
                if($stateParams.selectedId) $scope.page.view = 'view';
                $scope.account = {scope:[]};
                $scope.getUserAccountDetails();
            }
            
            if($location.search()){
                var url = $location.search();
                if(url.userId) {
                    if($location.url().split('&')[1]) {
                        var userId = $location.url().substring($location.url().lastIndexOf("=")+1,$location.url().lastIndexOf("&"));
                        var tenantId = $location.url().split('&')[1];
                        $scope.activateTenantUser(userId, tenantId);
                    }
                    else {
                        console.log($location.url().split('=')[1]);
                        var userId = $location.url().split('=')[1];
                        $scope.activateTenantUser(userId);
                    }
                    $location.url('/users');
                }
            }

            if($stateParams.tenantName || $stateParams.tenant) {
                getTenantId();
                if($stateParams.tenantName) 
                    $scope.tenantInfo = angular.copy($stateParams.tenantName);
                if($stateParams.tenant) 
                    $scope.tenantInfo = angular.copy($stateParams.tenant);
            }

            
            $scope.multiSelectText = {
                smartButtonMaxItems: 3,
                smartButtonTextConverter: function(itemText, originalItem) {
                    if (itemText === 'Jhon') {
                    return 'Jhonny!';
                    }

                    return itemText;
                }
            };
        }

        var getTenantId = function(){
            if($stateParams.tenantName) {
                $http.get('/tenant/'+ $stateParams.tenantName, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    $scope.tenantId = data._id;
                    console.log(data);
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                });
            }
        }
    
        $scope.authError = null;

        //Open tenant search modal
        $scope.searchModal = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'searchModalInstanceCtrl',
                size: size
            });

            modalInstance.result.then(function(tenant) {
                if($location.path() == '/users') {
                    if(!$scope.srch) $scope.srch = {};
                    $scope.srch.tenantId = tenant._id;
                    $scope.srch.tenantName = tenant.name;
                } else {
                    if(!$scope.account) $scope.account = {};
                    $scope.account.tenantId = tenant._id;
                    $scope.account.tenantName = tenant.name;
                }
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        $scope.resetForm = function () {
            $scope.srch = {
                scope: [],
                tenantName: []
            };
        }


        //Get Tenant-User account details by Admin
        $scope.getUserAccountDetails = function () {
            var id;
            if($stateParams.uname) id = $stateParams.uname;
            if($stateParams.selectedId) id = $stateParams.selectedId;
            if(id) {
                $http.get('/userByName/'+id, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {

                    for (var i = 0; i < data.scope.length; i++) {
                        for (var j = 0; j < $scope.rolesList.length; j++) {
                            if($scope.rolesList[j].id == data.scope[i]){
                                if(i==0) data.roles = $scope.rolesList[j].label;
                                else data.roles +=", "+$scope.rolesList[j].label;
                            }
                        };
                        data.scope[i] = {id: data.scope[i]};
                    };
                    $scope.account = data;
                    $scope.account.tenantName = data.tenantId.name;
                    $scope.account.tenantId = data.tenantId._id;
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                        growl.addErrorMessage(data.message);
                });
            }
        }

        //Get Tenant-User account details by Tenant-Admin
        $scope.getTenantUserbyTenant = function (id, srch) {
            if(srch) $scope.srchInfo = srch;
            $http.get('/userByTenant/'+ id, {
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

        //Generate Random Usernames
        $scope.generateRandomUserNames = function (email) {
            suggestionsList.async(email).then(function(response) {
                    $scope.suggestions = response.data;
                });
        }
  
        //Tenant-User account creation by Admin
        $scope.createTenantUserAccount = function (account_info, valid) {
            var dump = angular.copy(account_info);
            if(valid){
                for (var i = 0; i < account_info.scope.length; i++) {
                    account_info.scope[i] = angular.copy(account_info.scope[i].id);
                };
                var name,
                    validTenant;
                if(account_info.tenantName) {
                    if(account_info.tenantName._id)
                        account_info.tenantId = angular.copy(account_info.tenantName._id);
                    if(account_info.tenantName.name) {
                        $scope.tenantNameDup =  account_info.tenantName.name;
                        name = $scope.tenantNameDup;
                    }
                    else
                        name = account_info.tenantName;
                    validTenant = checkTenantName(name);
                }
                if($rootScope.user.tenantId)
                    account_info.tenantId = $rootScope.user.tenantId;
                if (validTenant) {
                    $http.post('/createUser', account_info, {
                        headers: AuthServ.getAuthHeader()
                    })
                    .success(function (data, status) {
                        growl.addSuccessMessage('User account has been created successfully');
                        $location.path('/users')
                        
                    })
                    .error(function (data, status) {
                         $scope.account = angular.copy(dump);
                        if(data.message == 'Invalid token') 
                            $scope.sessionExpire();
                        else
                          growl.addErrorMessage(data.message);
                    });
                }
                else{
                    $scope.account = angular.copy(dump); 
                    growl.addErrorMessage('Entered tenant is not existed');
                }
            }
        }

        var checkTenantName = function (name) {
            if($scope.tenantNameDup == name)
                return true;
            else 
                return false;
        }

        //Tenant-User account creation by Tenant-Admin
        $scope.createTenantUserAccountbyTenant = function (account_info, valid) {
            if(valid){
                account_info.tenantId = $scope.user.tenantId;
                $http.post('/tenantUserCreation', account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('User account has been created successfully');
                    $scope.page.view = 'search';
                    if($scope.srchInfo){
                        var srch = $scope.srchInfo;
                        $scope.srch = srch;
                        $scope.searchTenantUser(srch);
                    } 
                })
                .error(function (data, status) {
                    if(data.message == 'Invalid token') 
                        $scope.sessionExpire();
                    else
                      growl.addErrorMessage(data.message);
                });
            }
        }


        //get CreateUSer form
        $scope.createUser = function (srch) {
            if(srch) $scope.srchInfo = srch;
            $scope.page.view = 'create';
            $scope.account = {};
        }

        //Update User account details 
        $scope.updateUserAccount = function (account_info, valid) {
            if(valid){
                var dump = angular.copy(account_info);
                for (var i = 0; i < account_info.scope.length; i++) {
                    account_info.scope[i] = angular.copy(account_info.scope[i].id);
                };
                delete account_info._id, delete account_info.createdAt, 
                delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                var url;
                if(dump.tenantId)
                    url = dump._id+'/'+dump.tenantId;
                else
                    url = dump._id;
                $http.put('/user/'+url, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    $scope.getUserAccountDetails(dump._id);
                    $scope.page.view = 'view';
                    growl.addSuccessMessage('User account has been updated successfully');
                    $scope.searchTenantUser(localStorageService.get('userSearchObj'));
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
        $scope.searchTenantUser = function(obj){
            if(obj){
                var searchObj = angular.copy(obj);
                localStorageService.set('userSearchObj', searchObj);
            }
            if(!searchObj) searchObj = {};
            if(searchObj.scope) {
                if(searchObj.scope.length > 0) {
                    for (var i = 0; i < searchObj.scope.length; i++) {
                        searchObj.scope[i] = searchObj.scope[i].id;
                    };
                }
                else 
                    delete searchObj.scope;
            } 
            if(searchObj.tenantName != undefined) {
                if(searchObj.tenantName._id)
                        searchObj.tenantId = searchObj.tenantName._id;
            }
            if($stateParams.tenantName)
                searchObj.tenantId = $scope.tenantId;
            if($rootScope.user.tenantId)
                searchObj.tenantId = $rootScope.user.tenantId;
            if($scope.user.scope == 'Tenant-Admin') 
                searchObj.tenantId = $scope.user.tenantId;
            $http.post('/searchUser', searchObj, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.showUserResult = true;
                $scope.resultList = data;
                localStorageService.set('usersList', $scope.resultList);
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

        //Activate Tenant-User
        
        $scope.activateTenantUser = function(id, tenantId){
            var obj = {
                "id": id,
                "tenantId": tenantId
            }
            $http.post('/activateUser', obj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.searchTenantUser($scope.srch);
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
         $scope.deactivateTenantUser = function(id, tenantId){
            var obj = {
                "id": id,
                "tenantId": tenantId
            }
            $http.post('/deActivateUser', obj,  {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.searchTenantUser($scope.srch);
                growl.addSuccessMessage('User account has been deactivated successfully');
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

        //Delete Tenant-User
         $scope.deleteUserAccount = function(id, tenantId){
            var extUrl;
            if(tenantId)
                extUrl = id+'/'+tenantId;
            else
                extUrl = id;
            $http.delete('/deleteAccount/'+extUrl, {
                 headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.searchTenantUser(localStorageService.get('userSearchObj'));
                growl.addSuccessMessage('User account has been deleted successfully');
            })
            .error(function (data, status) {
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else if(data.message != "no user for tenant exist")
                    growl.addErrorMessage(data.message);
            });
        }

        $scope.cancelView = function () {
            $scope.page.view = 'search';
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

}]);

