var app = angular.module('shortlyApp', []);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    controller: 'IndexCtrl',
    templateUrl: 'templates/index.html'
  })
  .when('/create', {
    controller: 'CreateCtrl',
    templateUrl: 'templates/create.html'
  })
  .otherwise({
    redirectTo: '/'
  });

  $locationProvider.html5Mode(true);
})
.controller('IndexCtrl', function($scope, $http){
  $http.get('/links')
  .success(function(data) {
    $scope.links = data;
  })
  .error(function(data){
    console.log('get error: ', data);
  });

  $scope.moment = function(timestamp){
    var time = moment(timestamp).format('MMM D, h:mm:ss a');
    return time;
  };

  $scope.predicate = 'visits';
  $scope.reverse = 'true';
})
.controller('CreateCtrl', function($scope, $http){
  $scope.submit = function() {
    console.log($scope.url);
    $http.post('/links', {url: $scope.url})
    .success(function(data){
      $scope.link = data;
    })
    .error(function(data) {
      console.log('error', data);
    });
  };
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