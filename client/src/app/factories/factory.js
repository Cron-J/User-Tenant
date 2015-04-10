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
        if (authorizedRoles[0] == "*") 
          return true;
          return (authorizedRoles.indexOf($cookieStore.get('user').scope) !== -1);
        
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
