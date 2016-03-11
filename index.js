//Load .env file config (contains sensitive config info)
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}
require('dotenv').config();
//Setup Serial Protocols
var serialPort = require("serialport");
serialPort.list(function (err, ports) {
  var myPort = ports.find(function(port){
    var portName = port.comName.split("/")[2].slice(0, -1);
    return portName == "ttyUSB"
  })
  if(typeof myPort === 'undefined'){
    throw new Error("Could not connect to Arduino peripheral.")
  }
  else{
    ser = new serialPort.SerialPort(myPort.comName, {
     baudRate: 9600,
     parser: serialPort.parsers.readline("\r")
    }, false);
    ser.open(function (err) {
      if(err) console.log('err ' + err);
      else{
        ser.on('data', function(data) {
          console.log('data received: ' + data);
        });
        ser.on('close', function(){
          process.exit()
        });
        //Setup Express (our web server) and other express reqs
        var http = require("http")
        var fs = require("fs")
        var https = require("https")
        var express = require("express");
        var exphbs  = require('express-handlebars');
        var favicon = require('serve-favicon');
        var bodyParser = require('body-parser');
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
        var domoSerial = require("./logic/domoSerial")(ser);
        var domoActuate = require("./logic/domoActuate");
        var domoValidate = require("./res/js/domoValidate");
        var domoLights = require("./logic/domoLights")(domoValidate, domoActuate, domoSerial);
        var domoWeather = require("./logic/domoWeather")(domoActuate);
        var domoGCal = require("./logic/domoGCal")(domoActuate)
        var domoUtility = require("./logic/domoUtility")(app, domoActuate);
        var domoModes = require("./logic/domoModes")(domoActuate, domoLights, domoWeather, domoGCal, domoUtility);
        var confused = function(socket){
          var phrase_list = ["Sorry, I don't understand", "I'm a bit confused", "Pardon? I didn't catch that."]
          var phrase = phrase_list[Math.floor(Math.random() * phrase_list.length)]
          domoActuate.speak(phrase);
          socket.emit("msg", phrase);
        }
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
          socket.on("shutup", function(){
            domoUtility.shutup(socket)
          })
          socket.on("confused", function(){
            confused(socket)
          })
          socket.on("weather", function(day){
            domoWeather(day, socket);
          })
          socket.on("cal", function(time){
            domoGCal(time, socket);
          })
          socket.on("todo", function(){
            domoGCal("todo", socket);
          })
          socket.on("lights", function(command){
            domoActuate.speak("Setting lights to "+command,function(){
              socket.emit("ready")
            })
            domoLights.setStrip(command, socket)
          })
          socket.on("lamp", function(command){
            domoActuate.speak("Setting lamp to "+command,function(){
              socket.emit("ready")
            })
            domoLights.setLamp(command, socket)
          })
          socket.on("love mode", function(){
            domoModes.loveMode(io);
          })
          socket.on("all off", function(){
            domoSerial.allOff();
          })
          socket.on("all on", function(){
            domoSerial.allOn();
          })
          socket.on("party mode", function(){
            domoModes.partyMode(io);
          })
          socket.on("wake mode", function(){
            domoModes.wakeMode(io, socket);
          })
          socket.on("sleep mode", function(){
            domoModes.sleepMode(io);
          })
          socket.on("kill music", function(){
            domoModes.killMusic(socket);
          })
          console.log('A user connected!');
        });
        //Used to send commands from pebble (legacy), will eventually try and convert to https
        var http_server = http.createServer(app).listen(http_port);
        /*app.listen(port, function(){
          console.log("HTTP server started on port:",port)
          console.log("http://127.0.0.1:"+port)
        });*/
      }
    });
  }
})
