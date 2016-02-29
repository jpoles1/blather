//Get config
require('dotenv').config();
//Setup Express (our web server) and other express reqs
var fs = require("fs")
var http = require("http")
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
//Load .env file config (contains DB info)
require("./routing/main_logic")(app)
//Set the port for the server
http_port = 3030;
https_port = 4040;//Tell server to start listening on above port
try{
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
}
catch(e){
  console.log("Couldn't start HTTPS server.")
}
var http_server = http.createServer(app).listen(http_port, function(){
  console.log("HTTPS server started on port:",http_port)
  console.log("https://127.0.0.1:"+http_port)
});
/*app.listen(port, function(){
  console.log("HTTP server started on port:",port)
  console.log("http://127.0.0.1:"+port)
});*/
