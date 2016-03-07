//Load .env file config (contains sensitive config info)
require('dotenv').config();
//Setup Express (our web server) and other express reqs
var http = require("http")
var fs = require("fs")
var https = require("https")
var express = require("express");
var exphbs  = require('express-handlebars');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser')
//Create express server
var app = express()
//Sets the template engine to be handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main.hbs'}));
app.set('view engine', 'handlebars');
//Set server favicon
app.use(favicon(__dirname + '/res/favicon.ico'));
//Sets up the parser which can parse information out of HTTP POST requests
app.use(bodyParser.urlencoded({ extended: true }));
//Serves all files in the res folder as static resources
app.use('/res', express.static('res'));
//Load Domo Libraries
var domoActuate = require("./logic/domoActuate");
var domoValidate = require("./res/js/domoValidate");
var domoWeather = require("./logic/domoWeather")(domoActuate);
var domoGCal = require("./logic/domoGCal.js")(domoActuate)
var domoUtility = require("./logic/domoUtility")(app, domoActuate);
//Set the port for the server
http_port = 3030;
https_port = 4040;
//Setup HTTPS Server and Socket.io
var https_opts = {
  key : fs.readFileSync(__dirname +'/server.key'),
  cert : fs.readFileSync(__dirname +'/server.crt'),
  requestCert : false,
  rejectUnauthorized: false
}
var https_server = https.createServer(https_opts, app).listen(https_port, function(){
  console.log("HTTPS server started on port:",https_port)
  console.log("https://127.0.0.1:"+https_port)
});
//Socket.io
var io = require("socket.io")(https_server)
io.on('connection', function(socket){
  socket.on("time", function(){
    domoUtility.getTime(socket)
  })
  socket.on("date", function(){
    domoUtility.getDate(socket)
  })
  socket.on("thanks", function(){
    domoUtility.thanks(socket)
  })
  socket.on("weather", function(day){
    domoWeather(day, socket);
  })
  socket.on("cal", function(time){
    console.log(time)
    domoGCal(time, socket);
  })
  console.log('a user connected');
});
//Used to send commands from pebble (legacy), will eventually try and convert to https
var http_server = http.createServer(app).listen(http_port);
//Load in my routing modules.
require("./logic/main_logic")(app, domoActuate, domoValidate)

/*app.listen(port, function(){
  console.log("HTTP server started on port:",port)
  console.log("http://127.0.0.1:"+port)
});*/
