var mongoose = require("mongoose")
module.exports = function(domoSerial){
  domoMonitor = {};
  domoMonitor.room_status = {
    "pir": undefined,
    "lastpir": undefined,
    "pirct": 0, //Variable used to store the number of PIR trips in the past X minutes.
    "temp": undefined,
    "humid": undefined
  }
  domoMonitor.logSensors = function(rawdata){
    var room_status = this.room_status;
    var sensors = rawdata.toLowerCase().substring(0, rawdata.length-1).split(";");
    sensors.forEach(function(elem){
      var keywords = elem.split(":")
      console.log(keywords)
      if(keywords[0]=="pir" && keywords[1]=="1"){
        room_status["pirct"]+=1;
        room_status["lastpir"]=new Date();
        console.log("Detected Motion")
      }
      room_status[keywords[0]] = parseInt(keywords[1]);
    })
    console.log(room_status)
  }
  return domoMonitor;
}
