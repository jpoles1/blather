//Setup Python Commands
var PythonShell = require('python-shell');
//Setup Unix Command
var exec = require('child_process').exec;
var child;
//
var moment = require("moment")
//Setup Weater
var Wunderground = require('wundergroundnode');
var wunderground = new Wunderground(process.env.WUNDERGROUND_APIKEY);
var speaking_now = 0;
var zipcode = "77005"
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}
module.exports = function(app){
  app.get("/", function(req, res){
    res.render("mic.hbs", {})
  })
  app.get("/voice", function(req, res){
    heard_command = req.query.command.toLowerCase().split(" ");
    console.log(heard_command);
    if(heard_command.contains("weather") || heard_command.contains("whether")){
      getWeather(res, "77005");
    }
  });
  app.get("/time", function(req,res){
    var datetime = new Date();
    var time_str = "It is "+datetime.toTimeString().substring(0,5);
    speak(time_str);
    res.send(time_str);
  })
  app.get("/date", function(req,res){
    var datetime = new Date();
    var date_str = "Today is "+moment().format('dddd MMMM Do YYYY');
    speak(date_str);
    res.send(date_str);
  })
  app.get("/sexytime", function(req,res){
    speak("Activating Love Mode... ... Have fun!");
    setTimeout(function(){
      var options = {
        args: ["fade"]
      };
      runPyCommand("plugins/ardlights.py", options);
    }, 3*1000)
    setTimeout(function(){
      runSysCommand("mplayer -shuffle", __dirname+"/../res/music/*.mp3")
    }, 6*1000)
    res.send("LOVE MODE&trade; ACTIVATE");
  })
  app.get("/sexytime", function(req,res){
    speak("Activating Love Mode... ... Have fun!");
    setTimeout(function(){
      var options = {
        args: ["fade"]
      };
      runPyCommand("plugins/ardlights.py", options);
    }, 3*1000)
    setTimeout(function(){
      runSysCommand("mplayer -shuffle", __dirname+"/../res/music/*.mp3")
    }, 6*1000)
    res.send("LOVE MODE&trade; ACTIVATE");
  })
  app.get("/sleep", function(req,res){
    speak("Good night. Entering sleep mode.");
    setTimeout(function(){
      var options = {
        args: ["red"]
      };
      runPyCommand("plugins/ardlights.py", options);
    }, 3*1000)
    setTimeout(function(){
      var options = {
        args: ["dim"]
      };
      runPyCommand("plugins/ardlights.py", options);
    }, 6*1000)
    res.send("Good night. Entering sleep mode.");
  });
  app.get("/wake", function(req,res){
    speak("Good Morning. Starting wake mode!");
    setTimeout(function(){
      var options = {
        args: ["green"]
      };
      runPyCommand("plugins/ardlights.py", options);
    }, 3*1000)
    setTimeout(function(){
      var options = {
        args: ["bright"]
      };
      runPyCommand("plugins/ardlights.py", options);
    }, 6*1000)
    setTimeout(function(){
      getWeather(res, zipcode);
    }, 9*1000)
    res.send("Good Morning! Starting wake mode!");
  });
  app.get("/weather", function(req, res){
    try{
      var loc = req.query.loc;
      getWeather(res, loc)
    }
    catch(e){
      getWeather(res, zipcode)
    }
  });
  app.get("/lights", function(req,res){
    command = req.query.command.toLowerCase();
    console.log(command);
    var options = {
      args: [command]
    };
    runPyCommand("plugins/ardlights.py", options);
    res.send("Sent command: "+ command)
  });
}
function getWeather(res, loc){
  wunderground.conditions().request(loc, function(err, response){
    current_weather = response["current_observation"]
    report1 = "It is currently "+String(current_weather["temp_f"]).split(".")[0]+" degrees and "+current_weather["weather"]+". ";
    wunderground.forecast().request(loc, function(err, response){
      //report+=response["forecast"]["txt_forecast"]["forecastday"][0]["fcttext"]
      future_weather = response["forecast"]["simpleforecast"]["forecastday"][0]
      report2 ="On "+future_weather["date"]["weekday"]+", high of "+future_weather["high"]["fahrenheit"]+". "+future_weather["conditions"]+"."
      speak(report1+report2);
      res.send("<div style='font-size: 32pt'>Weather courtesy of Wunderground:<br>"+report1+"<br>"+report2+"</div>")
    });
  });
}
function runSysCommand(command, opts){
  child = exec(command+" "+opts, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}
function speak(phrase){
  runSysCommand("espeak -vmb-en1 -p40 -s160 -a180", "\""+phrase+"\"");
}
function runPyCommand(command, opts){
  command = command.replace(/[,#!$%\^&\*;:{}=`~()]/g,"");
  if(speaking_now!=1){
    speaking_now = 1;
    PythonShell.run(command, opts, function (err, results) {
      if (err) console.log("Lights error: ", err);
      console.log('results: %j', results);
      speaking_now = 0;
      return results
    });
  }
}
