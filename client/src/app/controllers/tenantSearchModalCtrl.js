'use strict';

app.controller('searchModalInstanceCtrl', ['$scope', '$http', '$modalInstance',
    'AuthServ', 'growl', 
    function ($scope, $http, $modalInstance, AuthServ, growl) {

    //Search Tenant
    $scope.searchTenant = function(searchObj){
        if(!searchObj) searchObj = {};
        $http.post('/searchTenant', searchObj,  {
            headers: AuthServ.getAuthHeader()
        })
        .success(function (data, status) {
            $scope.resultList = data;
            $scope.showTableData = true;
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

    

    //Get Tanant Id
    $scope.getTenantId = function(id) {
        $scope.submitted = true;
        $scope.reset_search();
        $modalInstance.close(id);
    }

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.reset_search = function () {
        $scope.searchQuery = {};
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

}]);

