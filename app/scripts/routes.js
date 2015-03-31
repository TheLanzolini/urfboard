'use strict';
/**
 * @ngdoc overview
 * @name urfboardApp:routes
 * @description
 * # routes.js
 *
 * Configure routes for use with Angular, and apply authentication security
 */
angular.module('urfboardApp')

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })

      .when('/chat', {
        templateUrl: 'views/chat.html',
        controller: 'ChatCtrl'
      })
      .otherwise({redirectTo: '/'});
  }]);
