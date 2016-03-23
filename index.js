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
var ser;
var serialPort = require("serialport");
var devMode = 0;
serialPort.list(function (err, ports) {
  var myPort = ports.find(function(port){
    var portName = port.comName.split("/")[2].slice(0, -1);
    return portName == "ttyUSB"
  })
  if(typeof myPort === 'undefined' && devMode == 0){
    throw new Error("Could not connect to Arduino peripheral.");
  }
  else{
    if(typeof myPort === 'undefined'){
      ser = {};
      ser.open = function(fun){
        fun();
      }
      ser.on = function(param, fun){}
      ser.write = function(t){}
    }
    else{
      ser = new serialPort.SerialPort(myPort.comName, {
       baudRate: 9600,
       parser: serialPort.parsers.readline("\r\n")
      }, false);
    }
    ser.open(function (err) {
      if(err) console.log('err ' + err);
      else{
        ser.on('data', function(rawdata) {
          var keywords = rawdata.toLowerCase().split(":");
          if(["pir", "temp", "humid"].contains(keywords[0])){
            domoMonitor.parseSensors(rawdata)
          }
          else{
            console.log('data received: ' + rawdata);
          }
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
        var confused = function(socket){
          var phrase_list = ["Sorry, I don't understand", "I'm a bit confused", "Pardon? I didn't catch that."]
          var phrase = phrase_list[Math.floor(Math.random() * phrase_list.length)]
          domoActuate.speak(phrase);
          socket.emit("msg", phrase);
        }
        var room_status = {
          "pir": undefined,
          "lastpir": undefined,
          "pirct": 0, //Variable used to store the number of PIR trips in the past X minutes.
          "temp": undefined,
          "humid": undefined,
          "outlets": {
            "1": undefined,
            "2": undefined
          },
          "inactive": undefined,
          "auto_on": undefined
        }
        var domoSerial = require("./logic/domoSerial")(ser, room_status);
        var domoMonitor = require("./logic/domoMonitor")(app, room_status, domoSerial);
        if(devMode==0){
          domoMonitor.logEvent("Restarted");
        }
        var domoActuate = require("./logic/domoActuate");
        var domoValidate = require("./res/js/domoValidate");
        var domoLights = require("./logic/domoLights")(app, domoValidate, domoActuate, domoSerial, domoMonitor, confused);
        var domoWeather = require("./logic/domoWeather")(domoActuate);
        var domoGCal = require("./logic/domoGCal")(domoActuate)
        var domoUtility = require("./logic/domoUtility")(app, domoActuate, domoMonitor);
        var domoModes = require("./logic/domoModes")(domoActuate, domoLights, domoWeather, domoGCal, domoUtility);
        var domoAnnyang = require("./logic/domoAnnyang")(app, domoLights, domoSerial, domoModes);

        //Set Lights Timeout
        setInterval(function(){
          if(room_status["pirct"]<1){
            if(Object.keys(room_status.outlets).some(function(x){return(room_status.outlets[x]=="on")})){
              room_status.inactive = {
                "start": Date.now(),
                "outletct": domoMonitor.countOutlets(),
                "outlets": Object.assign({}, room_status["outlets"])
              }
              domoMonitor.logEvent("Inactive")
            }
            if(typeof room_status["auto_on"] != "undefined" && room_status["auto_on"] == 1){
              domoMonitor.logEvent("Auto On Mistake") //Report a mistaken activation of lights if there is no more movement after 15 min.
            }
            domoLights.allOff("domo");
            setTimeout(function(){
              if(room_status["pirct"]>0){
                if(typeof room_status.inactive != "undefined"){
                  domoMonitor.endInactive();
                }
              }
            }, 15*1000)
          }
          room_status["auto_on"] = undefined; //Remove auto_on setting.
          room_status["pirct"] = 0;
        }, 15*60*1000);
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
          console.log("Voice Input at: https://127.0.0.1:"+https_port)
          console.log("Monitoring at: https://127.0.0.1:"+https_port+"/charts")
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
          socket.on("room temp", function(day){
            domoUtility.getRoomTemp(socket);
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
            domoLights.allOff();
            domoActuate.speak("All off",function(){
              socket.emit("ready")
            })
          })
          socket.on("all on", function(){
            domoLights.allOn();
            domoActuate.speak("All on",function(){
              socket.emit("ready")
            })
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
