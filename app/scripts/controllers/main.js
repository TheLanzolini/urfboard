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

function mainCtrl($scope, $firebaseObject, Ref, $http, $rootScope, $q, $timeout, $firebaseArray){

  $scope.match_id = 1778704162;

  $rootScope.lol_key = $firebaseObject(Ref.child('lol_key'));
  $rootScope.lol_key.$loaded().then(makeRequest).catch(alert);

  $scope.top_ten = $firebaseArray(Ref.child('top_ten'));
  $scope.top_ten.$loaded().then(populateTopTen).catch(alert);

  $scope.compare = function(a,b){
    if (a.stats.totalDamageDealtToChampions > b.stats.totalDamageDealtToChampions)
     return -1;
    if (a.stats.totalDamageDealtToChampions < b.stats.totalDamageDealtToChampions)
      return 1;
    return 0;        
  }

  function alert(msg) {
    $scope.err = msg;
    $timeout(function() {
      $scope.err = null;
    }, 5000);
  }

  function populateTopTen(){
    console.log($scope.top_ten);
  }

  function makeRequest(){
    $scope.api_url = 'https://na.api.pvp.net/api/lol/na/v2.2/match/'+$scope.match_id+'?includeTimeline=false&api_key='+$rootScope.lol_key.$value;
    $http.get($scope.api_url)
      .then(handleSuccess)
      .then(compareToTopTen)
    ;
    function handleSuccess(data){
      $scope.participants = data.data.participants
      return $q.when($scope.participants, $scope.top_ten.length);
    }
    function handleError(err){
      console.log(err);
    }

    function compareToTopTen(){
      if($scope.top_ten.length == 0){
        console.log('making top ten');
        $scope.participants.sort($scope.compare)
        for(var i=0;i<$scope.participants.length;i++){
          $scope.top_ten.$add($scope.participants[i]);
        }
      }else{
        console.log('top ten already there');
        var copied = angular.copy($scope.top_ten);
        var extended = copied.concat($scope.participants);
        extended.sort($scope.compare);
        extended.splice(10, 10);
        if(angular.equals($scope.top_ten, extended)){
          console.log('its same');
        }else{
          console.log('its diff');
          console.log(extended);
        }
      }
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
      $http.get('https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion/'+scope.championId+'?champData=image&api_key='+$rootScope.lol_key.$value)
        .success(function(res){
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
