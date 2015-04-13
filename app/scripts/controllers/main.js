

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
  .directive('itemImg', itemImg)
  .directive('urfAudio', urfAudio)
  .filter('compareDamage', compareDamage)
  .filter('showRank', showRank)
;

function mainCtrl(
  $scope, 
  $firebaseObject, 
  Ref, 
  $http, 
  $rootScope, 
  $q, 
  $timeout, 
  $firebaseArray, 
  $interval
  ){

  console.log('You may be considering other entries to win, but this says otherwise: http://i.imgur.com/FJsJrey.jpg');
  $rootScope.lol_key = $firebaseObject(Ref.child('lol_key'));
  $rootScope.top_ten = $firebaseObject(Ref.child('top_ten'));
  $scope.match_ids = $firebaseArray(Ref.child('match_ids'));

  $scope.urfMatchIds = [];

  $scope.modalShow = false;

  $scope.showInfoModal = function(){
    if($scope.modalShow){
      $scope.modalShow = false;
    }else{
      $scope.modalShow = true;
    }
  }


  $rootScope.lol_key.$loaded().then(function(){
    $rootScope.top_ten.$loaded().then(function(){
      $scope.getUrfMatchIds().then(function(data){
        $scope.urfMatchIds = $scope.urfMatchIds.concat(data);
        $interval(function(){
          $scope.getUrfMatchIds().then(function(data){
            $scope.urfMatchIds = $scope.urfMatchIds.concat(data);
          });
        }, 360000);
      }).catch(alert);
    }).catch(alert);
  }).catch(alert);

  $interval(function(){
    if($scope.urfMatchIds[0]){
      makeRequest($scope.urfMatchIds[0]).then(function(){
        $scope.urfMatchIds.splice(0,1);
      });
    }
  }, 10000);

  $scope.participantsExist = function(){
    if($scope.participants){
      return true;
    }else{
      return false;
    }
  }
  
  $scope.getUrfMatchIds = function(){
    var cur_time = new Date().getTime();
    var coeff = 1000 * 60 * 5;
    var timestamp = new Date(Math.floor(cur_time / coeff) * coeff - 2 * coeff);

    var urfUrl = 'https://na.api.pvp.net/api/lol/na/v4.1/game/ids?beginDate='+timestamp/1000+'&api_key='+$rootScope.lol_key.$value;
    return $http.get(urfUrl)
      .then(function(data){
        return data.data;
      })
    ;
  }

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

  function makeRequest(match_id){
    $scope.api_url = 'https://na.api.pvp.net/api/lol/na/v2.2/match/'+match_id+'?includeTimeline=false&api_key='+$rootScope.lol_key.$value;
    return $http.get($scope.api_url)
      .then(handleSuccess)
      .then(compareToTopTen)
    ;
    function handleSuccess(data){
      $scope.participants = data.data.participants;
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
        $scope.top_ten.isSet = true;
        $scope.top_ten.participants = $scope.participants.sort($scope.compare);
        $scope.top_ten.$save();
      }else if(!$scope.found){
        var before = $scope.top_ten.participants;
        $scope.top_ten.participants = $scope.top_ten.participants.concat($scope.participants);
        $scope.top_ten.participants.sort($scope.compare);
        $scope.top_ten.participants.splice(10, 10);
        var after = $scope.top_ten.participants;
        if(!angular.equals(before, after)){
          console.log('A NEW RECORD!');
          var vid = document.getElementById("newrecord");
          vid.play();
        }
        $scope.top_ten.$save();
      }else{
        // console.log('match has already been processed');
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

function itemImg($http, $rootScope){
  return {
    restrict: 'E',
    scope: {
      itemId: '=item'
    },
    template: '<div class="item-square"></div>',
    link: function(scope, element, attrs){
      if(scope.itemId != 0){
        $http.get('https://global.api.pvp.net/api/lol/static-data/na/v1.2/item/'+scope.itemId+'?locale=en_US&itemData=image&api_key='+$rootScope.lol_key.$value)
          .success(function(res){
            scope.itemName = res.name;
            scope.itemImgLink = 'http://ddragon.leagueoflegends.com/cdn/5.6.1/img/sprite/'+res.image.sprite;
            element.find('div').css('background-image', 'url('+scope.itemImgLink+')');
            element.find('div').css('background-position-x', '-'+res.image.x+'px');
            element.find('div').css('background-position-y', '-'+res.image.y+'px');
          })
        ;
      }
    }
  };
}

function urfAudio($rootScope){
  return {
    restrict: 'E',
    template: '<audio id="newrecord"><source src="audio/newrecord.mp3" type="audio/mpeg"></audio>'
  //   link: function(scope, element, attrs){
  //     var vid = document.getElementById("newrecord");
  //     var topTenWatch = $rootScope.top_ten.$loaded(function(){
  //       $rootScope.top_ten.$watch(function(){
  //         console.log('A new record!');
  //         vid.play();
  //       });
  //     });
  //   }
  }
}

function compareDamage($rootScope){
  return function(damage){
    return Math.round((damage/$rootScope.top_ten.participants[0].stats.totalDamageDealtToChampions) * 10);
  }
}

function showRank(){
  return function(input){
    switch(input){
      case 0: 
        return "Probably DC'd";
        break;
      case 1:
        return "Weenie";
        break;
      case 2:
        return "Caster Minion";
        break;
      case 3:
        return "Melee Minion";
        break;
      case 4:
        return "Scuttle";
        break;
      case 5:
        return "Gromp";
        break;
      case 6:
        return "Dragon";
        break;
      case 7:
        return "Baron";
        break;
      case 8:
        return "Dominating!";
        break;
      case 9: 
        return "Wicked Sick!";
        break;
      case 10:
        return "G-G-Godlike!";
        break;
    }
  }
}









