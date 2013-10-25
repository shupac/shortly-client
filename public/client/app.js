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
    console.log('hello');
    console.log(data);
    $scope.links = data;
  })
  .error(function(data){
    console.log('get error: ', data);
  });
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
});