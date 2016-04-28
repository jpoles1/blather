//Setup Weater
var Wunderground = require('wundergroundnode');
var wunderground = new Wunderground(process.env.WUNDERGROUND_APIKEY);
var moment = require("moment");
var zipcode = "77005"
module.exports = function(domoActuate){
  var getTodaysWeather = function(cb){
    wunderground.conditions().request(loc, function(err, response){
      current_weather = response["current_observation"]
      report1 = "It is currently "+String(current_weather["temp_f"]).split(".")[0]+" degrees and "+current_weather["weather"]+". ";
      wunderground.forecast().request(loc, function(err, response){
        //report+=response["forecast"]["txt_forecast"]["forecastday"][0]["fcttext"]
        future_weather = response["forecast"]["simpleforecast"]["forecastday"][0]
        report2 ="On "+future_weather["date"]["weekday"]+", high of "+future_weather["high"]["fahrenheit"]+". "+future_weather["conditions"]+"."
        domoActuate.speak(report1+report2, function(){
          cb("<div style='font-size: 32pt'>Weather courtesy of Wunderground:<br>"+report1+"<br>"+report2+"</div>");
        });
      });
    });
  }
  var getFutureWeather = function(day, cb){
    wunderground.forecast().request(loc, function(err, response){
      try{
        //report+=response["forecast"]["txt_forecast"]["forecastday"][0]["fcttext"]
        if(day=="tomorrow"){
          var day_index = 1;
        }
        else{
          day_index = moment().day(day).startOf("day").diff(moment().startOf("day"), "days");
        }
        future_weather = response["forecast"]["simpleforecast"]["forecastday"][day_index]
        report2 ="On "+future_weather["date"]["weekday"]+", high of "+future_weather["high"]["fahrenheit"]+". "+future_weather["conditions"]+"."
        domoActuate.speak(report2, function(){
          cb("<div style='font-size: 32pt'>Weather courtesy of Wunderground:<br>"+report2+"</div>");
        });
      }
      catch(e){
        domoActuate.speak("Failed to fetch weather for: "+day, function(){
          cb("Failed to fetch weather for: "+day);
        });
      }
    });
  }
  var getWeather = function(day, socket, cb){
    if(typeof cb === 'undefined'){
      cb = function(msg){
        if(socket != 'undefined'){
          domoActuate.socketReply(socket, "ready")
          domoActuate.socketReply(socket, "msg", msg)
        }
      }
    }
    loc = zipcode;
    console.log("WEATHER", day)
    if(day=="today"){
      getTodaysWeather(cb)
    }
    else{
      getFutureWeather(day, cb)
    }
  }
  return getWeather;
}
