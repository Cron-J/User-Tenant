'use strict';

app.controller('adminCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter','$cookieStore', '$stateParams', '$modal', 
    '$log', 'userInfo',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $cookieStore, $stateParams, $modal, $log, userInfo) {
        var _scope = {};
        _scope.init = function() {
            $scope.view = 'create';
            userInfo.async().then(function(response) {
                $scope.current_usr.firstName = response.data.firstName;
                $scope.current_usr.lastName = response.data.lastName;
            });
        }

        $scope.user = $cookieStore.get('user');
        $scope.authError = null;
        
        //Get tenant-admins list
        var getTenantsList = function () {
            $http.get('/tenant', {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                $scope.tenantList = data;
            })
            .error(function (data, status) {
                growl.addErrorMessage(data.message);
            });
        }

        //Reset search
        $scope.reset = function(){
            $scope.srch = {};
        }

        //Export Tent-Users Data
        $scope.exportUserData = function () {
            $http.get('/exportUser', {
                headers: AuthServ.getAuthHeader()
            })
            .success(function(data, status) {
                var element = angular.element('<a/>');
                element.attr({
                   href: 'data:attachment/csv;charset=utf-8,' + encodeURI(data),
                   target: '_blank',
                   download: 'users.csv'
                })[0].click();
                 growl.addSuccessMessage('Export is successfull');
            })
            .error(function(data, status) {
                growl.addErrorMessage(data.message);    
            });

        }

        //Search Tenant
        $scope.searchTenant = function(searchObj){
            if(!searchObj) searchObj = {};
            console.log(searchObj);
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
                growl.addErrorMessage(data.message);
            });
        }

        //Get Tenant Details
        $scope.getTenant = function (id) {
             $location.path('/tenant/'+id);
        }

        //Search Tenant-User
        $scope.searchTenantUser = function(searchObj){
            if(!searchObj) searchObj = {};
            console.log(searchObj);
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
                growl.addErrorMessage(data.message);
            });
        }

        //Get Tenant-User Details
        $scope.getTenantUser = function (id) {
             $location.path('/user/'+id);
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



