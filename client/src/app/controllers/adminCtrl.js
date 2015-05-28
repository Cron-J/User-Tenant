'use strict';

app.controller('adminCtrl', ['$scope', '$rootScope', '$http', '$location', 
    'AuthServ', 'growl', '$filter','$cookieStore', '$stateParams', '$modal', 
    '$log', 'userInfo', 'countryList',
    function ($scope, $rootScope, $http, $location, AuthServ, growl, $filter, 
        $cookieStore, $stateParams, $modal, $log, userInfo, countryList) {
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
                if(data.message == 'Invalid token')
                    $scope.sessionExpire();
                else
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
                if(data.message == 'Invalid token') 
                    $scope.sessionExpire();
                else
                    growl.addErrorMessage(data.message);    
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

        //Get Tenant Details
        $scope.getTenant = function (id) {
             $location.path('/tenant/'+id);
        }

        //Search Tenant-User
        $scope.searchTenantUser = function(searchObj){
            if(!searchObj) searchObj = {};
            console.log(searchObj);
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
                if($scope.srch == undefined)
                    $scope.srch = {};
                if(tenant.description) 
                    $scope.srch.tenantName = tenant.name+", "+tenant.description;
                else
                     $scope.srch.tenantName = tenant.name;
                $scope.srch.tenantId = tenant._id;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        //Tenant Search by name
        $scope.searchTenantByName = function($viewValue){
            console.log('entered');
            var temp = [];
            var obj = {};
            obj['key'] = "name";
            obj['value'] = $viewValue;
            temp.push(obj);
            return $http.post('/searchTenant', obj).
            then(function(data){
              var tenantList = [];
              angular.forEach(data.data, function(item){ 
              console.log('item', item);    
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



