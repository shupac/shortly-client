var app = angular.module('shortlyApp', []);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    controller: 'IndexCtrl',
    templateUrl: 'templates/index.html'
  })
  .when('/signup', {
    controller: 'SignupCtrl',
    templateUrl: 'templates/signup.html'
  })
  .otherwise({
    redirectTo: '/'
  });

  $locationProvider.html5Mode(true);
})

// .controller('CreateCtrl', function($scope, $http, $location){
//   $scope.submit = function() {
//     $http.post('/links', {url: $scope.url})
//     .success(function(data){
//     })
//     .error(function(data) {
//       console.log('error', data);
//     });
//   };
// })
.controller('SignupCtrl', function($scope, $http){
  $scope.submit = function(){
    console.log('post');
    $http({
      method: 'POST',
      url: '/signup',
      data: {
        username: $scope.user.username,
        password: $scope.user.password
      }
    })
    .success(function(data) {
      console.log(data);
    });
  }
})
.controller('IndexCtrl', function($scope, $http){
  $scope.gettingData = false;
  $scope.submit = function() {
    $scope.gettingData = true;
    $http.post('/links', {url: $scope.url})
    .success(function(data){
      $scope.getLinks();
      $scope.gettingData = false;
    })
    .error(function(data) {
      console.log('error', data);
      $scope.gettingData = false;
    });
  };

  $scope.getLinks = function() {
    $http.get('/links')
    .success(function(data) {
      $scope.links = data;
    })
    .error(function(data){
      console.log('get error: ', data);
    });
  };

  $scope.moment = function(timestamp){
    var time = moment(timestamp).format('MMM D, h:mm:ss a');
    return time;
  };

  $scope.predicate = 'visits';
  $scope.reverse = 'true';
  $scope.getLinks();
})

.controller('SortCtrl', function($scope){
  $scope.displaySort = function(predicate){
    var sort;
    switch(predicate) {
      case 'visits':
        sort = 'number of visits';
        break;
      case 'updated_at':
        sort = 'last visit';
        break;
      case 'created_at':
        sort = 'when created';
        break;
      default:
        break;
    }
    return sort;
  };
}).
controller('LinkStats', function($scope, $http){
  $scope.showingStats = false;
  $scope.showStats = function(id) {
    $http.get('/stats/'+id).success(function(data) {
      $scope.clicks = data;
    });
    $scope.showingStats = true;
  };

  $scope.hideStats = function() {
    $scope.showingStats = false;
  };
});