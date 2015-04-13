'use strict';

app.controller('adminCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter','$cookieStore', '$stateParams',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $cookieStore, $stateParams) {
        var _scope = {};
        _scope.init = function() {
           // getAccountInfo();
           // getTenantsList(); 
        }

       
        $scope.user = $cookieStore.get('user');
        $scope.authError = null;

        //Get personal account details
        var getAccountInfo = function () {
            $http.get('/user', {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                console.log('##########', data);
                // AuthServ.setUserToken(data, $scope.loginForm.remember);
                // growl.addSuccessMessage('Your account has been updated successfully');
                // $location.path('app');
            })
            .error(function (data, status) {
                growl.addErrorMessage(data.message);
            });
        }

        //Update account
        $scope.updateAccount = function (account_info, valid) {
            if(valid){
                delete account_info._id;
                $http.put('/user', account_info, {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    // AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Your account has been updated successfully');
                    // $location.path('app');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }
        
        //Get tenant-admins list
        var getTenantsList = function () {
            $http.get('/tenant', {
                headers: AuthServ.getAuthHeader()
            })
            .success(function (data, status) {
                // AuthServ.setUserToken(data, $scope.loginForm.remember);
                // growl.addSuccessMessage('Account has been updated successfully');
                // $location.path('app');
                $scope.tenantList = data;
                console.log('fgsdfj', $scope.tenantList);
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

        //Search Tenant
        $scope.searchTenant = function(searchObj){
            
                // var rqstData = customTransform();
                console.log('hdukas', AuthServ.getAuthHeader());
                if(!searchObj) searchObj = {};
                console.log(searchObj);
                $http.post('/serarchTenant', searchObj,  {
                    headers: AuthServ.getAuthHeader()
                })
                .success(function (data, status) {
                    $scope.showResult = true;
                    console.log('$scope.showResult : ', $scope.showResult);
                    $scope.resultList = data;
                    // $scope.data = data;
                     $scope.currentPage = 0;
                     $scope.groupToPages();
                     console.log(data);
                 
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

