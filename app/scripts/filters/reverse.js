'use strict';

angular.module('urfboardApp')
  .filter('reverse', function() {
    return function(items) {
      return angular.isArray(items)? items.slice().reverse() : [];
    };
  });
