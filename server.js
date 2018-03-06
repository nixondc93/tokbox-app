const express = require('express');
const app = express(); 
const bodyParser = require('body-parser'); 
const OpenTok = require('opentok')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/client/views'));
app.use(express.static(__dirname + '/client/css'));
app.use(express.static(__dirname + '/client/js'));

// OPEN TOK INIT
const apiKey = process.env.API_KEY,
    apiSecret = process.env.API_SECRET;

const opentok = new OpenTok(apiKey, apiSecret);
if (!apiKey || !apiSecret) {
    console.log('You must specify API_KEY and API_SECRET environment variables');
    process.exit(1);
}

//create Session and return token
app.get('/session', (request, response) => {
    opentok.createSession(function(error, session) {
        if (error){
            response.send({error}); 
        }else{
            let token = session.generateToken({
                expireTime : (new Date().getTime() / 1000)+(24 * 60 * 60), // in one day
            });
            response.send({sessionId: session.sessionId, token, apiKey});
        } 
    });
}); 

// create token from sessionId
app.get('/session/:id/join', (request, response) => {
    let token = opentok.generateToken(request.params.id);
    response.send({token, apiKey, sessionId: request.params.id});
});

// disconnect from chat
app.get('/disconnect', (request, response) => {
    opentok.forceDisconnect(request.params.sessionId, request.params.connectionId, function(error) {
        if (error){
            response.send({error});
        }else{
            response.send({success: true, message: 'User has been disconnected'});
        }
    });
});

//rendering view
app.get('/', (request, response) => {
    response.sendFile('./index.html');
});

//port
app.listen(3000, function() {
    console.log('You\'re app is now ready at http://localhost:3000/');
});

  