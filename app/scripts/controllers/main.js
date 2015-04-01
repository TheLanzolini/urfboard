'use strict';

/**
 * @ngdoc function
 * @name urfboardApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the urfboardApp
 */
angular.module('urfboardApp')
  .controller('MainCtrl', mainCtrl)
  .directive('champImg', champImg)
;

function mainCtrl($scope, $firebaseObject, Ref, $http, $rootScope, $q, $timeout){

  $scope.match_id = 1778704162;

  $rootScope.lol_key = $firebaseObject(Ref.child('lol_key'));
  $rootScope.lol_key.$loaded().then(makeRequest).catch(alert);


  function alert(msg) {
    $scope.err = msg;
    $timeout(function() {
      $scope.err = null;
    }, 5000);
  }

  function makeRequest(){
    $scope.api_url = 'https://na.api.pvp.net/api/lol/na/v2.2/match/'+$scope.match_id+'?includeTimeline=false&api_key='+$rootScope.lol_key.$value;
    $http.get($scope.api_url)
      .then(handleSuccess)
    ;
    function handleSuccess(data){
      $scope.participants = data.data.participants
      return $q.when($scope.participants);
    }
    function handleError(err){
      console.log(err);
    }
  }
} 

function champImg($http, $rootScope){
  return {
    restrict: 'E',
    scope: {
      championId: '=champ'
    },
    template: '<div class="champ-square"></div>',
    link: function(scope, element, attrs){
      console.log(scope.championId);
      $http.get('https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion/'+scope.championId+'?champData=image&api_key='+$rootScope.lol_key.$value)
        .success(function(res){
          console.log(res.image);
          scope.champName = res.name;
          scope.championImgLink = 'http://ddragon.leagueoflegends.com/cdn/5.6.1/img/sprite/'+res.image.sprite;
          element.find('div').css('background-image', 'url('+scope.championImgLink+')');
          element.find('div').css('background-position-x', '-'+res.image.x+'px');
          element.find('div').css('background-position-y', '-'+res.image.y+'px');
        })
      ;     
    }
  };
}
