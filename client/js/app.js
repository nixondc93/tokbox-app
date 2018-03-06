const App = angular.module('chatApp',  []);

App.controller('chatAppController', function($scope, $http) {
    $scope.chatStarted = false; 
    $scope.getSession = function(){
        $http({
            method: 'GET',
            url: '/session'
        }).then(function successCallback(response) {
            $scope.apiKey = response.data.apiKey; 
            $scope.sessionId = response.data.sessionId; 
            $scope.token = response.data.token; 
            $scope.initChat();
            $scope.chatStarted = true; 
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

    $scope.jionMeeting = function() {
        if ($scope.text) {
            $http({
                method: 'GET',
                url: `/session/${$scope.text}/join`
            }).then(function successCallback(response) {

                $scope.joinToken = response.data.token;

                let session = OT.initSession(response.data.apiKey, response.data.sessionId);
                
                session.on('streamCreated', function(event) {
                    $scope.stream = event.stream
                    session.subscribe(event.stream);
                });
                
                session.connect($scope.token, function (error) {
                    if(error) {
                        alert(error);
                    }
                });
            }, function errorCallback(response){
                alert('Error: Invalid Session ID', response);
            });
            $scope.text = '';
        }
    };

    $scope.disconnect = function(){
        console.log('disconect');
        $scope.session.unsubscribe($scope.stream);
    };
});

