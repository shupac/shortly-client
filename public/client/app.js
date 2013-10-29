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
  .when('/login', {
    controller: 'LoginCtrl',
    templateUrl: 'templates/login.html'
  })
  .otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
})
.run(function($rootScope, $location, SessionService) {
  $rootScope.$on('$routeChangeStart', function(evt, next, current){
    if(!SessionService.isLoggedIn()) {
      if(next.controller !== 'SignupCtrl') {
        $location.path('/login');
      }
    }
  });
  // on every location change, check to see if user is authenticated
  // if not authenticated, redirect to /login
})
.factory('SessionService', function($http, $q, $location){
  var service = {
    currentUser: null,
    isLoggedIn: function() {
      if(service.currentUser) return true;
      else return false;
    },
    login: function(id) {
      service.currentUser = id;
      $location.path('/');
    },
    logout: function() {
      service.currentUser = null;
      $location.path('/login');
    }
  };
  return service;
})
.controller('SignupCtrl', function($scope, $http, SessionService, $location){
  $scope.submit = function(){
    console.log('post', $scope.user.username, $scope.user.password);
    $http({
      url: '/signup',
      method: 'POST',
      data: {
        username: $scope.user.username,
        password: $scope.user.password
      }
    })
    .success(function(data) {
      if(data.success) {
        SessionService.login(data.id);
        $location.path('/');
      } else {
        console.log(data.message);
      }
    });
  };
})
.controller('LoginCtrl', function($scope, $http, SessionService, $location){
  $scope.submit = function(){
    console.log('post', $scope.user.username, $scope.user.password);
    $http({
      url: '/login',
      method: 'POST',
      data: {
        username: $scope.user.username,
        password: $scope.user.password
      }
    })
    .success(function(data) {
      if(data.success) {
        SessionService.login(data.id);
        $location.path('/');
      } else {
        console.log(data.message);
      }
    });
  };
})
.controller('IndexCtrl', function($scope, $http, SessionService){
  console.log('hey!');
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

  $scope.logout = function() {
    console.log('logout');
    SessionService.logout();
  };

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