'use strict';

/**
 * @ngdoc function
 * @name urfboardApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the urfboardApp
 */
angular.module('urfboardApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
