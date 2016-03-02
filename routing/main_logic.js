//Setup Python Commands
var PythonShell = require('python-shell');
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
module.exports = function(app, speak){
  app.get("/voice", function(req, res){
    heard_command = req.query.command.toLowerCase().split(" ");
    console.log(heard_command);
    if(heard_command.contains("weather") || heard_command.contains("whether")){
      getWeather(res, "77005");
    }
  });
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
        args: ["off"]
      };
      speak("Turning lights off.")
      runPyCommand("plugins/ardlights.py", options);
    }, 3*1000)
    res.send("Good night. Entering sleep mode.");
  });
  app.get("/wake", function(req,res){
    speak("Good Morning. Starting wake mode!");
    setTimeout(function(){
      var options = {
        args: ["on", "green", "bright"]
      };
      speak("Turning lights on. Setting to bright green.")
      runPyCommand("plugins/ardlights.py", options);
    }, 3*1000)
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
    var options = {
      args: command.split(" ").reverse()
    };
    speak("Setting lights to "+command)
    runPyCommand("plugins/ardlights.py", options);
    res.send("Sent command: "+ command)
  });
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
  function runPyCommand(command, opts){
    command = command.replace(/[,#!$%\^&\*;:{}=`~()]/g,"");
    PythonShell.run(command, opts, function (err, results) {
      if (err){
        console.log("Lights error: ", err);
        speak(String(err).split(":")[2]);
      }
      console.log('results: %j', results);
      return results
    });
  }
}
