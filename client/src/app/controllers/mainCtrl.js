'use strict';

app.controller('mainCtrl', ['$scope', '$rootScope', '$http', '$location', 
     'growl', '$filter', 'userInfo','$cookieStore',
    function ($scope, $rootScope, $http, $location, growl, $filter, userInfo,$cookieStore) {
        var _scope = {};
        $scope.current_usr = {};
        userInfo.async().then(function(response) {
          $scope.current_usr = response.data;
        });
        console.log($cookieStore.get('curr_user'));

      }]);