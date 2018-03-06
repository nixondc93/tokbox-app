const App = angular.module('chatApp',  ['ui.router']);


App.config(['$urlRouterProvider', '$stateProvider', function ($RouterProvider, $stateProvider){
    $stateProvider.state('root', {
        url: '/first',
        template: '<h1>header</h1>'
    })
    .state('chatRoom', {
        url: '/join',
        templateURL: 'template/video_chat.html'
    });
    console.log('app.config');
    // $urlRouterProvider.otherwise('/');
    
}]);
  
App.controller('chatAppController', function($scope, $http, $window) {
    $scope.getSession = function(){
        $http({
            method: 'GET',
            url: '/session'
        }).then(function successCallback(response) {
            $scope.apiKey = response.data.apiKey; 
            $scope.sessionId = response.data.sessionId; 
            $scope.token = response.data.token; 
            $window.location.href = `session/${$scope.sessionId}/join`;
            console.log($scope.apiKey, $scope.sessionId, $scope.token);
        }, function errorCallback(response) {
              alert(response);
        });
    };

    $scope.initChat = function(){
        // replace these values with those generated in your TokBox Account
        let apiKey = $scope.apiKey;
        let sessionId = $scope.sessionId;
        let token = $scope.token; 
    
        initializeSession();

        // Handling all of our errors here by alerting them
        function handleError(error) {
            if (error) {
                alert(error.message);
            }
        }

        function initializeSession() {
            var session = OT.initSession(apiKey, sessionId);
            // Subscribe to a newly created stream
            session.on('streamCreated', function (event) {
                session.subscribe(event.stream, 'subscriber', {
                insertMode: 'append',
                width: '100%',
                height: '100%'
                }, handleError);
            });
            // Create a publisher
            var publisher = OT.initPublisher('publisher', {
            insertMode: 'append',
            width: '100%',
            height: '100%'
            }, handleError);
            // Connect to the session
            session.connect(token, function (error) {
            // If the connection is successful, publish to the session
                if (error) {
                    handleError(error);
                } else {
                    session.publish(publisher, handleError);
                }
            });
        }

    };
});

