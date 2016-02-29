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
    speak("It is "+datetime.toTimeString().substring(0,5))
  })
  app.get("/date", function(req,res){
    var datetime = new Date();
    speak("Today is "+moment().format('dddd MMMM Do YYYY'))
  })
  app.get("/weather", function(req, res){
    getWeather(res, "77005")
  });
  app.get("/lights", function(req,res){
    command = req.query.command.toLowerCase();
    console.log(command);
    var options = {
      args: [command]
    };
    runPyCommand("plugins/ardlights.py", options);
    console.log("Sent command: "+ command)
    res.send("Sent command: "+ command)
  });
}
function getWeather(res, loc){
  wunderground.conditions().request(loc, function(err, response){
    current_weather = response["current_observation"]
    report = "It is currently "+String(current_weather["temp_f"]).split(".")[0]+" degrees and "+current_weather["weather"]+". ";
    wunderground.forecast().request(loc, function(err, response){
      //report+=response["forecast"]["txt_forecast"]["forecastday"][0]["fcttext"]
      future_weather = response["forecast"]["simpleforecast"]["forecastday"][0]
      report+="On "+future_weather["date"]["weekday"]+", high of "+future_weather["high"]["fahrenheit"]+". "+future_weather["conditions"]+"."
      speak(report);
      res.send("Got weather courtesy of Weather Underground:<br><br>"+report)
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
  runSysCommand("espeak", "\""+phrase+"\" -s 190");
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
