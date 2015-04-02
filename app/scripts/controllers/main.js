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


  $rootScope.lol_key = $firebaseObject(Ref.child('lol_key'));
  $scope.top_ten = $firebaseObject(Ref.child('top_ten'));
  $scope.match_ids = $firebaseArray(Ref.child('match_ids'));


  $rootScope.lol_key.$loaded().then(function(){
    $scope.top_ten.$loaded().then(function(){
      // var match_id = 1778704162;
      var match_id = 1780726063;
      makeRequest(match_id);
    }).catch(alert);
  }).catch(alert);

  
  

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

  function makeRequest(match_id){
    $scope.api_url = 'https://na.api.pvp.net/api/lol/na/v2.2/match/'+match_id+'?includeTimeline=false&api_key='+$rootScope.lol_key.$value;
    $http.get($scope.api_url)
      .then(handleSuccess)
      .then(compareToTopTen)
    ;
    function handleSuccess(data){
      $scope.participants = data.data.participants;
      console.log($scope.match_ids, data.data);
      // $scope.match_ids.$add(data.data.matchId);
      $scope.found = false;
      for(var i=0;i<$scope.match_ids.length;i++){
        if($scope.match_ids[i].$value == data.data.matchId){
          $scope.found = true; 
        }
      }
      if(!$scope.found){
        $scope.match_ids.$add(data.data.matchId);
      }
      return $q.when($scope.participants);
    }
    function handleError(err){
      console.log(err);
    }

    function compareToTopTen(){
      if(!$scope.top_ten.isSet){
        console.log('making top ten');
        $scope.top_ten.isSet = true;
        $scope.top_ten.participants = $scope.participants.sort($scope.compare);
        $scope.top_ten.$save();
      }else if(!$scope.found){
        console.log('top ten is set, match has not been processed merging array and splicing');
        $scope.top_ten.participants = $scope.top_ten.participants.concat($scope.participants);
        $scope.top_ten.participants.sort($scope.compare);
        $scope.top_ten.participants.splice(10, 10);
        console.log($scope.top_ten.participants, $scope.participants);
        $scope.top_ten.$save();
      }else{
        console.log('match has already been processed');
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
