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
                    $scope.current_usr.firstName = response.data.firstName;
                    $scope.current_usr.lastName = response.data.lastName;
                });
                getTenantUsers();
            }
            if($stateParams.tenantId) 
               $scope.getTenant();
           //country list
            countryList.async().then(function(response) {
                $scope.countryList = response.data;
            });
            $scope.countryList1 = angular.copy($scope.countryList);
            $scope.clearCountrySelection();
        }
       
        // $scope.user = {};
        $scope.authError = null;

        //Get Tenant Details
        $scope.getTenant = function () {
            $http.get('/tenant/'+ $stateParams.tenantId, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.view = 'view';
                $scope.current_usr.firstName = data.name;
                $scope.current_usr.lastName = '';
                for (var i = 0; i < $scope.countryList.length; i++) {
                    if($scope.countryList[i].code == data.address.country ) {
                        data.address.country = [];
                        data.address.country[0] = {};
                        data.address.country[0] = $scope.countryList[i];
                        data.address.country[0].ticked = true;
                    }
                };
                $scope.tenant = data;
            })
            .error(function (data, status) {
                growl.addErrorMessage(data.message);
            });
        }
        
        //Tenant account creation
        $scope.createTenantAccount = function (account_info, valid) {
            if(valid){
                account_info.tenant.validFrom = $filter('date')(account_info.tenant.validFrom, "MM/dd/yyyy");
                account_info.tenant.validTo = $filter('date')(account_info.tenant.validTo, "MM/dd/yyyy");
                account_info.tenant.address.country = account_info.tenant.address.country[0].code;
                account_info.user.address.country = account_info.user.address.country[0].code;
                $http.post('/tenant', account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    growl.addSuccessMessage('Tenant has been created successfully');
                    $location.path('tenants');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }

        //Update tenant account
        $scope.updateTenantAccount = function (account_info, valid) {
            if(valid){
                account_info.address.country = account_info.address.country[0].code;
                delete account_info._id, delete account_info.tenantId, 
                delete account_info.createdAt, delete account_info.createdBy, delete account_info.updatedAt,
                delete account_info.updatedBy;
                $http.put('/tenant/'+$stateParams.tenantId, account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    // AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Tenant account has been updated successfully');
                    $location.path('/tenants');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }

        //Get Tenant-User Details
        $scope.getTenantUser = function (id) {
           $location.path('/tenantUser/'+id);
        }

        //Get Tenant-Users List
        var getTenantUsers = function () {
            $http.get('/tenantUser/'+ $scope.current_usr._id, {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.resultList = data;
                $scope.currentPage = 0;
                $scope.groupToPages();
            })
            .error(function (data, status) {
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

        //Date picker
        $scope.open1 = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened1 = true;
        };

        $scope.open2 = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened2 = true;
        };

        // $scope.dateOptions = {
        //     formatYear: 'yy',
        //     startingDay: 1
        // };

        $scope.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];

        _scope.init();
}]);

