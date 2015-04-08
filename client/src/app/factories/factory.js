'use strict';

/* Factories */
// All the directives rely on jQuery.

angular.module('app.factory', [])

.factory('AuthServ', function ($cookieStore) {
  var user;
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
    setUserToken: function (newUser, save) {
      user = newUser;
      if(!save) {
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
    }
  };
})
