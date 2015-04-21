'use strict';

/* Factories */
// All the directives rely on jQuery.

angular.module('app.factory', [])

.factory('AuthServ', function ($cookieStore,$rootScope) {
  var user;
  if($cookieStore.get('user')){
      user = $cookieStore.get('user');
      $rootScope.user=user;
    }
  return {
    getToken: function () {
      return user.token;
    },
    getUser: function () {
      return user;
    },
    getAuthHeader: function () {
      return (user && user.token) ? { 'Authorization': 'Bearer ' + user.token } : {};
    },
    setUserToken: function (newUser) {
      user = newUser;
      if(!user) {
        return this.clearCookie();
      }
      this.saveToCookie();
    },
    saveToCookie: function () {
      $cookieStore.put('user', user);
    },
    clearCookie: function () {
      $cookieStore.remove('user');
    },
    loadFromCookie: function () {
      user = $cookieStore.get('user');
    },
    removeUser: function() {
        user = null;
        $cookieStore.put('user', user);

    },
    isAuthorized: function(authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        if (authorizedRoles[0] == '*') 
          return true;
        if($cookieStore.get('user')) 
          return (authorizedRoles.indexOf($cookieStore.get('user').scope) !== -1);
        else
          return false
    },

    isLoggedInAsync: function(cb) {
        if (user && user.scope) {
            cb(true);
        }
        else{
           cb(false);
        }
       
    }

};
})
.factory('userInfo', function ($http, AuthServ, growl, $rootScope) {
   var promise;
   var myService = {
    async: function() {

        // $http returns a promise, which has a then function, which also returns a promise
        promise = $http.get('/user', {
            headers: AuthServ.getAuthHeader()
        })
        .success(function (data, status) {
          return data;   
        })
        .error(function (data, status) {
            if(data.message == 'Invalid token') {
                delete $rootScope.user;
                growl.addErrorMessage('Session has expired');
            } 
            else
              growl.addErrorMessage(data.message);
        });

      // Return the promise to the controller
      return promise;
    }
  };
  return myService;
})
.factory('countryList', function ($http, AuthServ, growl) {
   var promise;
   var list = {
    async: function() {

        // $http returns a promise, which has a then function, which also returns a promise
        promise = $http.get('/countryList')
        .success(function (data, status) {
            return data;
        })
        .error(function (data, status) {
            growl.addErrorMessage(data.message);
        });
      // Return the promise to the controller
      return promise;
    }
  };
  return list;

});

