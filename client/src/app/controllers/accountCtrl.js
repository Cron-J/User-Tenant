'use strict';

app.controller('accountCtrl', ['$scope', '$http', '$location', 
    'AuthServ', 'growl', '$filter',
    function ($scope, $http, $location, AuthServ, growl, $filter) {
        var _scope = {};
        _scope.init = function() {
           $scope.isUser = true;
        }
        $scope.loginForm = {
            remember: true
        };
        $scope.user = {};
        $scope.authError = null;
        
        //create account
        $scope.createAccount = function (account_info, valid) {
            if(valid){
                 var type = "Self";
                account_info.tenant.createdBy = type;
                account_info.tenant.updatedBy = type;
                account_info.user.createdBy = type;
                account_info.user.updatedBy = type;
                account_info.tenant.validFrom = $filter('date')(account_info.tenant.validFrom, "MM/dd/yyyy");
                account_info.tenant.validTo = $filter('date')(account_info.tenant.validTo, "MM/dd/yyyy");
                 $http.post('/user', account_info)
                .success(function (data, status) {
                    // AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Account has been created successfully');
                    $location.path('app');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });
            }
        }

        $scope.login = function (user) {
            $http.post('/login', user)
                .success(function (data, status) {
                    AuthServ.setUserToken(data, $scope.loginForm.remember);
                    growl.addSuccessMessage('Successfully logged in');
                    $location.path('home');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                });

        }

        $scope.forgotPassword = function (email_add) {
            $http.post('/forgotPassword', {userId:email_add})
                .success(function (data, status) {
                    console.log(data);
                    growl.addSuccessMessage('Email has been sent');
                    $location.path('/login');
                })
                .error(function (data, status) {
                    growl.addErrorMessage(data.message);
                })
        }

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

